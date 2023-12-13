const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type QueryResult<T> = {
    error?: Error;
    data: T;
};

export abstract class DataQuery<T> {
    private data_promise: Promise<QueryResult<T>>;

    protected abstract fetchData(): Promise<QueryResult<T>>;

    async getData() {
        console.log("getData");
        if (!this.data_promise) {
            this.data_promise = this.fetchData();
        }

        return this.data_promise;
    }
}

export class DataSourceQuery extends DataQuery<number> {
    protected async fetchData(): Promise<QueryResult<number>> {
        console.log("DataSourceQuery - fetchData");
        await sleep(5000);
        return { data: 1 };
    }
}

export class NativeDataQuery extends DataQuery<string> {
    async fetchData(): Promise<QueryResult<string>> {
        console.log("NativeDataQuery - fetchData");
        await sleep(5000);
        return { data: "test" };
    }
}
