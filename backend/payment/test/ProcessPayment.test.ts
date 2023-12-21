import PgPromiseAdapter from "../src/infra/database/PgPromiseAdapter";
import crypto from "crypto";
import TransactionRepositoryORM from "../src/infra/repository/TransactionRepositoryORM";
import ProcessPayment from "../src/application/usecase/ProcessPayment";
import GetTransactionByRideId from "../src/application/usecase/GetTransactionByRideId";
import Queue from "../src/infra/queue/Queue";

test("Deve processar um pagamento", async function () {
	const connection = new PgPromiseAdapter();
	const transactionRepository = new TransactionRepositoryORM(connection);
	const queue: Queue = {
		async publish (exchange: string, data: any): Promise<void> {
		},
		async consume (exchange: string, queue: string, callback: Function): Promise<void> {
		}
	}
	const processPayment = new ProcessPayment(transactionRepository, queue);
	const rideId = crypto.randomUUID();
	const inputProcessPayment = {
		rideId,
		creditCardToken: "123456789",
		amount: 1000
	};
	await processPayment.execute(inputProcessPayment);
	const getTransactionByRideId = new GetTransactionByRideId(transactionRepository);
	const output = await getTransactionByRideId.execute(rideId);
	expect(output.rideId).toBe(rideId);
	expect(output.status).toBe("paid");
	await connection.close();
});
