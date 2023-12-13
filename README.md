This attempts to solve 2 things - multiple validators dependent on the same data, validators that are dependent on other validations passing first.

*Solving Dependent Data*: 
For this I created an abstract class `DataQuery`. Subclasses will implement `fetchData` to actually get the data and clients will use `getData` which returns the same promise of fetchData. By using the same promise, multiple calls to `getData` will only call `fetchData` once.

*Solving Parent Validators*: 
A new `ValidatorWithDependencies` class that contains a list of parents it depends on and helper function to wait for all parents to finish running their `validate()` calls. It also kicks off all parents `validate()`. By having the children call the parent `validate()`, it allows for easier concurrency. However, it means that `validate()` should not take any data so that the child does not need to provide things to the parent. All data access should either be done through a data query or be provided in the constructor.

A potential thing we can do with `ValidatorWithDependencies` is have the base class implement validate and call `waitForDependencies` then it calls an abastract function that the subclasses need to implement to actually do the validation..

*To Run*

```npm install```

```npm start```

To see failures and stuff, mess with what is being passed to the validators in `index.ts`
