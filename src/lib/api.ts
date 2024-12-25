import ky, { HTTPError } from "ky";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

interface ValidationError {
  validation?: string;
  code?: string;
  message: string;
  path?: string[];
}

interface APIErrorResponse {
  success: boolean;
  message: string;
  error?: ValidationError[] | string;
}

const createInstance = (accessToken?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_API_URL,
    headers,
    hooks: {
      beforeError: [
        async (error: HTTPError) => {
          const { response } = error;

          try {
            const body = (await response.json()) as APIErrorResponse;
            console.log("API Error Response:", body);

            let errorMessage: string;

            if (typeof body.error === "string") {
              // When error is a string
              errorMessage = body.error;
            } else if (Array.isArray(body.error) && body.error.length > 0) {
              // When error is an array of validation errors
              errorMessage = body.error[0].message;
            } else {
              // Fallback to message
              errorMessage = body.message;
            }

            console.log("Final Error Message:", errorMessage);
            throw new ApiError(errorMessage);
          } catch (parseError) {
            if (parseError instanceof ApiError) {
              throw parseError;
            }
            throw new ApiError(response.statusText);
          }
        },
      ],
    },
  });
};

export const createApi = (accessToken?: string) => {
  const instance = createInstance(accessToken);

  return {
    get: async <T>(url: string): Promise<T> => {
      const cleanUrl = url.replace(/^\//, "");
      return instance.get(cleanUrl).json<T>();
    },

    post: async <T>(url: string, data?: unknown): Promise<T> => {
      const cleanUrl = url.replace(/^\//, "");
      return instance.post(cleanUrl, { json: data }).json<T>();
    },

    put: async <T>(url: string, data?: unknown): Promise<T> => {
      const cleanUrl = url.replace(/^\//, "");
      return instance.put(cleanUrl, { json: data }).json<T>();
    },

    delete: async <T>(url: string): Promise<T> => {
      const cleanUrl = url.replace(/^\//, "");
      return instance.delete(cleanUrl).json<T>();
    },
  };
};

export default createApi;
