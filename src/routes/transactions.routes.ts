import { Router } from 'express';
import multer from 'multer';

import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  /** TODO: GET /transactions: Essa rota deve retornar uma listagem com todas as
   * transações que você cadastrou até agora, junto com o valor da soma de
   * entradas, retiradas e total de crédito. */
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  /** TODO: POST /transactions:
   * A rota deve receber title, value, type, e category dentro do corpo da
   * requisição, sendo o type o tipo da transação, que deve ser income para
   * entradas (depósitos) e outcome para saídas (retiradas). Ao cadastrar uma
   * nova transação, ela deve ser armazenada dentro do seu banco de dados,
   * possuindo os campos id, title, value, type, category_id, created_at, updated_at */
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  /** TODO: DELETE /transactions/:id:
   * A rota deve deletar uma transação com o id presente nos parâmetros da rota
   * */
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    /** TODO: POST /transactions/import:
     * A rota deve permitir a importação de um arquivo com formato .csv contendo
     * as mesmas informações necessárias para criação de uma transação id, title,
     * value, type, category_id, created_at, updated_at, onde cada linha do arquivo
     * CSV deve ser um novo registro para o banco de dados, e por fim retorne todas
     * as transactions que foram importadas para seu banco de dados.
     */
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
