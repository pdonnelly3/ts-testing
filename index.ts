import { DataSourceQuery, NativeDataQuery } from "./src/DataQuery";
import {
    DataSourceValidator,
    DependentNativeValidator,
    NativeIntegrationValidator,
} from "./src/Validator";

const nativeQ = new NativeDataQuery();
const dsQ = new DataSourceQuery();
const nativeValidator = new NativeIntegrationValidator(nativeQ, "test");
const dsValidator = new DataSourceValidator(nativeQ, dsQ, 2);

const tests = [
    new DependentNativeValidator([nativeValidator], "one"),
    new DependentNativeValidator([nativeValidator, dsValidator], "one"),
    nativeValidator,
    dsValidator,
];

Promise.all(tests.map((t) => t.validate()))
    .then((res) => console.table(res))
    .catch((err) => console.error(err));
