import { DataSourceQuery, NativeDataQuery } from "./src/DataQuery";
import {
    DataSourceValidator,
    DependentNativeValidator,
    DependentValidatorWithSharedData,
    NativeIntegrationValidator,
} from "./src/Validator";

const nativeQ = new NativeDataQuery();
const dsQ = new DataSourceQuery();
const passedNativeValidator = new NativeIntegrationValidator(nativeQ, "test");
const passedDsValidator = new DataSourceValidator(nativeQ, dsQ, 1);
const failedNativeValidator = new NativeIntegrationValidator(nativeQ, "native");
const failedDsValidator = new DataSourceValidator(nativeQ, dsQ, 2);
const dependentValidator = new DependentNativeValidator(
    [passedNativeValidator, passedNativeValidator],
    "one"
);

const tests = [
    passedNativeValidator,
    new DependentNativeValidator([passedNativeValidator], "one"),
    new DependentNativeValidator([dependentValidator], "one"),
    new DependentNativeValidator(
        [passedNativeValidator, passedDsValidator],
        "one"
    ),
    passedDsValidator,
    dependentValidator,
    new DependentNativeValidator([failedNativeValidator], "one"),
    new DependentNativeValidator(
        [passedNativeValidator, failedDsValidator],
        "one"
    ),
    failedNativeValidator,
    failedDsValidator,
    new DependentValidatorWithSharedData(
        [passedNativeValidator, passedDsValidator],
        "one",
        nativeQ
    ),
];

Promise.all(tests.map((t) => t.validate()))
    .then((res) => {
        console.log("*********");
        console.log("Results");
        console.table(res);
    })
    .catch((err) => console.error(err));
