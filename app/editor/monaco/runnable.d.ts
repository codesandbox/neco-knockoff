declare module "modules/ffi" {
    import { Env } from "../bindings/env";
    export default class FFI {
        static ident: number;
        static env: Env;
    }
}
declare module "modules/base" {
    export default class Base {
        get env(): import("bindings/env").Env;
        get ident(): number;
        ffiResult(resultSize: number): Uint8Array;
    }
}
declare module "modules/db" {
    import Base from "modules/base";
    type Variables = {
        [key: string]: string;
    };
    export default class DB extends Base {
        select(name: string, variables?: Variables): object;
        insert(name: string, variables?: Variables): {
            lastInsertID?: number | string;
        };
        update(name: string, variables?: Variables): {
            rowsAffected: number;
        };
        delete(name: string, variables?: Variables): {
            rowsAffected: number;
        };
        private exec;
    }
}
declare module "modules/cache" {
    import Base from "modules/base";
    export default class Cache extends Base {
        get(key: string): string;
        getBytes(key: string): Uint8Array;
        set(key: string, value: string | Uint8Array, ttl: number): void;
    }
}
declare module "modules/file" {
    import Base from "modules/base";
    export default class File extends Base {
        getStatic(key: string): string;
        getStaticBytes(name: string): Uint8Array;
    }
}
declare module "modules/helpers" {
    export function renderHeaderString(headers: {
        [key: string]: string;
    }): string;
}
declare module "modules/graphql" {
    import Base from "modules/base";
    export default class GraphQL extends Base {
        query(endpoint: string, query: string, headers?: {
            [key: string]: string;
        }): string;
    }
}
declare module "modules/http" {
    import Base from "modules/base";
    type Headers = {
        [key: string]: string;
    };
    export class HttpResponse {
        private value;
        constructor(value: Uint8Array);
        arrayBuffer(): ArrayBuffer;
        json(): object;
        text(): string;
    }
    export default class Http extends Base {
        get(url: string, headers?: Headers): HttpResponse;
        head(url: string, headers?: Headers): HttpResponse;
        options(url: string, headers?: Headers): HttpResponse;
        post(url: string, body: string | Uint8Array, headers?: Headers): HttpResponse;
        put(url: string, body: string | Uint8Array, headers?: Headers): HttpResponse;
        patch(url: string, body: string | Uint8Array, headers?: Headers): HttpResponse;
        delete(url: string, headers?: Headers): HttpResponse;
        private request;
    }
}
declare module "modules/log" {
    import Base from "modules/base";
    export default class Log extends Base {
        info(message: string): void;
        warn(message: string): void;
        error(message: string): void;
        debug(message: string): void;
        private log;
    }
}
declare module "modules/request" {
    import Base from "modules/base";
    export default class Request extends Base {
        method(): string;
        url(): string;
        id(): string;
        body(): string;
        bodyBytes(): Uint8Array;
        bodyField(key: string): string;
        header(key: string): string;
        urlParam(key: string): string;
        state(key: string): string;
        stateBytes(key: string): Uint8Array;
        private getField;
    }
}
declare module "modules/response" {
    import Base from "modules/base";
    export default class Response extends Base {
        setHeader(key: string, value: string): void;
        contentType(value: string): void;
    }
}
declare module "modules/runnable" {
    import Base from "modules/base";
    export default class Runnable extends Base {
        returnResult(result: string | Uint8Array): void;
        returnError(code: number, error: string): void;
    }
}
declare module "@flaki/runnable" {
    import DB from "modules/db";
    import Cache from "modules/cache";
    import File from "modules/file";
    import GraphQL from "modules/graphql";
    import Http from "modules/http";
    import Log from "modules/log";
    import Request from "modules/request";
    import Response from "modules/response";
    import Runnable from "modules/runnable";
    export const db: DB;
    export const cache: Cache;
    export const file: File;
    export const graphql: GraphQL;
    export const http: Http;
    export const log: Log;
    export const request: Request;
    export const response: Response;
    export const runnable: Runnable;
    export function setup(imports: object, ident: number): void;
}
declare module "bindings/intrinsics" {
    export function clamp_host(i: any, min: any, max: any): any;
    export function utf8_encode(s: any, realloc: any, memory: any): number;
    export let UTF8_ENCODED_LEN: number;
}
declare module "bindings/env" {
    export const LogLevel: Readonly<{
        0: "Null";
        Null: 0;
        1: "Error";
        Error: 1;
        2: "Warn";
        Warn: 2;
        3: "Info";
        Info: 3;
        4: "Debug";
        Debug: 4;
    }>;
    export const HttpMethod: Readonly<{
        0: "Get";
        Get: 0;
        1: "Head";
        Head: 1;
        2: "Options";
        Options: 2;
        3: "Post";
        Post: 3;
        4: "Put";
        Put: 4;
        5: "Patch";
        Patch: 5;
        6: "Delete";
        Delete: 6;
    }>;
    export const FieldType: Readonly<{
        0: "Meta";
        Meta: 0;
        1: "Body";
        Body: 1;
        2: "Header";
        Header: 2;
        3: "Params";
        Params: 3;
        4: "State";
        State: 4;
        5: "Query";
        Query: 5;
    }>;
    export const QueryType: Readonly<{
        0: "Select";
        Select: 0;
        1: "Insert";
        Insert: 1;
        2: "Update";
        Update: 2;
        3: "Delete";
        Delete: 3;
    }>;
    export class Env {
        addToImports(imports: any): void;
        instantiate(module: any, imports: any): Promise<void>;
        instance: WebAssembly.Instance;
        _exports: WebAssembly.Exports;
        returnResult(arg0: any, arg1: any): any;
        returnError(arg0: any, arg1: any, arg2: any): any;
        logMsg(arg0: any, arg1: any, arg2: any): any;
        fetchUrl(arg0: any, arg1: any, arg2: any, arg3: any): any;
        graphqlQuery(arg0: any, arg1: any, arg2: any): any;
        cacheSet(arg0: any, arg1: any, arg2: any, arg3: any): any;
        cacheGet(arg0: any, arg1: any): any;
        requestGetField(arg0: any, arg1: any, arg2: any): any;
        requestSetField(arg0: any, arg1: any, arg2: any, arg3: any): any;
        respSetHeader(arg0: any, arg1: any, arg2: any): any;
        getStaticFile(arg0: any, arg1: any): any;
        dbExec(arg0: any, arg1: any, arg2: any): any;
        getFfiResult(arg0: any, arg1: any): any;
        addFfiVar(arg0: any, arg1: any, arg2: any): any;
        returnAbort(arg0: any, arg1: any, arg2: any, arg3: any, arg4: any): any;
    }
}
