import { DataQuery, DataSourceQuery, NativeDataQuery } from "./DataQuery";

export abstract class Test<ToValidate = unknown> {
    private _testPromise: Promise<boolean>;

    constructor(protected toValidate: ToValidate) {}

    protected abstract runTest(): Promise<boolean>;

    public validate() {
        if (!this._testPromise) {
            this._testPromise = this.runTest();
        }

        return this._testPromise;
    }
}

export abstract class TestWithDependencies<T = unknown> extends Test<T> {
    constructor(protected dependencies: Test[], protected toValidate: T) {
        super(toValidate);
    }

    async waitForDependencies(): Promise<boolean> {
        const results = await Promise.all(
            this.dependencies.map((d) => d.validate())
        );
        return results.reduce((prev, curr) => prev && curr);
    }
}

export class NativeIntegrationTest extends Test<string> {
    constructor(
        private nativeIntegrationQuery: NativeDataQuery,
        protected toValidate: string
    ) {
        super(toValidate);
    }

    async runTest(): Promise<boolean> {
        console.log("Running Native Test");
        const { data, error } = await this.nativeIntegrationQuery.getData();

        if (error) {
            return false;
        }

        return data === this.toValidate;
    }
}

export class DataSourceTest extends Test<number> {
    constructor(
        private nativeIntegrationQuery: NativeDataQuery,
        private dataSourceQuery: DataSourceQuery,
        protected toValidate: number
    ) {
        super(toValidate);
    }

    async runTest(): Promise<boolean> {
        const ds = await this.dataSourceQuery.getData();
        if (ds.error) {
            return false;
        }

        const native = await this.nativeIntegrationQuery.getData();
        console.log("get native");
        if (native.error) {
            return false;
        }

        return ds.data === this.toValidate;
    }
}

export class DependentNativeTest extends TestWithDependencies<string> {
    constructor(protected dependencies: Test[], protected toValidate: string) {
        super(dependencies, toValidate);
    }

    async runTest(): Promise<boolean> {
        if (!(await this.waitForDependencies())) {
            console.log("Parent Failed");
            return false;
        }
        console.log("Parent passed");

        return this.toValidate === "one";
    }
}
