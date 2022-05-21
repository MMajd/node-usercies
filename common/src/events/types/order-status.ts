export enum OrderStatus {
  // default status when order is initialized by client
  Created = "order:created",
  // order could be cancelled for the following reasons
  // 1. tickets trying to reserve has been already reserved
  // 2. order expires before payment
  // 3. when user cancel the order himself
  Cancelled = "order:cancelled",
  // tickets has been successfully reserved
  AwaitingPayment = "order:awaiting:payment",
  // payment provided successfully
  Complete = "order:complete",
}
