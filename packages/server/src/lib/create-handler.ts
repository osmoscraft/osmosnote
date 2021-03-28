import type { FastifyRequest } from "fastify";

export function createHandler<OutputType, InputType>(sourceHandler: (input: InputType) => Promise<OutputType>) {
  const decoratedHandler = async (
    request: FastifyRequest<{
      Body: InputType;
      Reply: OutputSuccessOrError<OutputType>;
    }>
  ) => {
    try {
      const output = await sourceHandler(request.body);
      return {
        data: output,
      };
    } catch (error) {
      console.error(`[error]`, error);
      return {
        error: {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      };
    }
  };

  return decoratedHandler;
}

export interface OutputSuccessOrError<T> {
  data?: T;
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}
