import { DataSourceQuery, NativeDataQuery } from "./DataQuery";

export abstract class Validator<ToValidate = unknown> {
    private _testPromise: Promise<boolean>;
    protected name: string;
    protected id: number;

    constructor(protected toValidate: ToValidate) {}

    protected abstract runTest(): Promise<boolean>;

    public validate() {
        if (!this._testPromise) {
            this._testPromise = this.runTest();
        } else {
            this.printMessage("Test already started...");
        }

        return this._testPromise;
    }

    public printMessage(text: string) {
        console.log(`${this.name} - ${this.id}: ${text}`);
    }
}

export abstract class ValidatorWithDependencies<
    T = unknown
> extends Validator<T> {
    constructor(protected dependencies: Validator[], protected toValidate: T) {
        super(toValidate);
    }

    async waitForDependencies(): Promise<boolean> {
        this.printMessage("Waiting for dependencies to finish...");
        const results = await Promise.all(
            this.dependencies.map((d) => d.validate())
        );
        return results.reduce((prev, curr) => prev && curr);
    }
}

export class NativeIntegrationValidator extends Validator<string> {
    public static ID_COUNTER = 1;
    name = "NativeIntegrationValidator";

    constructor(
        private nativeIntegrationQuery: NativeDataQuery,
        protected toValidate: string
    ) {
        super(toValidate);
        this.id = NativeIntegrationValidator.ID_COUNTER;
        NativeIntegrationValidator.ID_COUNTER += 1;
    }

    async runTest(): Promise<boolean> {
        this.printMessage("Running test");

        this.printMessage("Getting Native Integration Data");
        const { data, error } = await this.nativeIntegrationQuery.getData();
        this.printMessage("Retrieved Native Integration Data");

        if (error) {
            return false;
        }

        return data === this.toValidate;
    }
}

export class DataSourceValidator extends Validator<number> {
    name = "DataSourceValidator";
    static ID_COUNTER = 1;

    constructor(
        private nativeIntegrationQuery: NativeDataQuery,
        private dataSourceQuery: DataSourceQuery,
        protected toValidate: number
    ) {
        super(toValidate);
        this.id = DataSourceValidator.ID_COUNTER;
        DataSourceValidator.ID_COUNTER += 1;
    }

    async runTest(): Promise<boolean> {
        this.printMessage("Running Test");

        this.printMessage("Getting Native Integration Data");
        const native = await this.nativeIntegrationQuery.getData();
        this.printMessage("Retrieved Native Integration Data");

        if (native.error) {
            return false;
        }

        this.printMessage("Getting Data Source Data");
        const ds = await this.dataSourceQuery.getData();
        this.printMessage("Retrieved Data Source Data");

        if (ds.error) {
            return false;
        }

        return ds.data === this.toValidate;
    }
}

export class DependentNativeValidator extends ValidatorWithDependencies<string> {
    static ID_COUNTER = 1;
    name = "DependentNativeValidator";

    constructor(
        protected dependencies: Validator[],
        protected toValidate: string
    ) {
        super(dependencies, toValidate);
        this.id = DependentNativeValidator.ID_COUNTER;
        DependentNativeValidator.ID_COUNTER += 1;
    }

    async runTest(): Promise<boolean> {
        this.printMessage("Running Test");

        if (!(await this.waitForDependencies())) {
            this.printMessage("Parent Failed");
            return false;
        }
        this.printMessage("Parent passed");

        return this.toValidate === "one";
    }
}
