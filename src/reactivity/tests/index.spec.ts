function add(a, b) {
  return a + b;
}

it("init", () => {
  expect(add(1, 1)).toBe(2);
});
