export interface Project {
  id: string;
  name : string;
  description : string;
}

// This is an interface that lets you handle arbitrary request types
export interface HttpResponse<T> extends Response {
  parsedBody?: T;
}


async function http<T>(request: RequestInfo): Promise<HttpResponse<T>> {
    // TODO: This could throw, so it needs to be handled in the future
  const response: HttpResponse<T> = await fetch(request);

  try {
    // Note: may error if there is no body
    response.parsedBody = await response.json();
  } catch (ex) {
      console.log("EMPTY BODY RETURNED");
  }

  if (!response.ok) {
    console.log("Unexpected status returned:" + response.status);
  }
  return response;
}

// TODO: Temporarily disabled cors, undo this when react is hosted on server
export async function  get<T>(path: string, args: RequestInit = { method: "get" } ): Promise<HttpResponse<T>> {
  return await http<T>(new Request(path, args));
};

export async function post<T>(path: string, body: any, args: RequestInit = { method: "post", body: JSON.stringify(body) }): Promise<HttpResponse<T>>  {
  return await http<T>(new Request(path, args));
};

export async function put<T>(path: string, body: any, args: RequestInit = { method: "put", body: JSON.stringify(body) }): Promise<HttpResponse<T>> {
  return await http<T>(new Request(path, args));
};