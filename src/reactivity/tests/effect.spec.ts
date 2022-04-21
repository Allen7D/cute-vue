import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it("test effect", () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update data
    user.age++;
    expect(nextAge).toBe(12);
  });
});
