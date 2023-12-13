import { DataSourceQuery, NativeDataQuery } from "./src/DataQuery";
import {
    DataSourceTest,
    DependentNativeTest,
    NativeIntegrationTest,
} from "./src/Test";

const nativeQ = new NativeDataQuery();
const dsQ = new DataSourceQuery();
const nativeTest = new NativeIntegrationTest(nativeQ, "test");
const dsTest = new DataSourceTest(nativeQ, dsQ, 2);

const tests = [
    new DependentNativeTest([nativeTest], "one"),
    new DependentNativeTest([nativeTest, dsTest], "one"),
    nativeTest,
    dsTest,
];

Promise.all(tests.map((t) => t.validate()))
    .then((res) => console.table(res))
    .catch((err) => console.error(err));
