// The Job -> What We offloads to BullMQ to handle
export const sendEmail = async (email: string) => {
  console.log("sending Email...");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("Email Sent to: ", email);
  return;
};
