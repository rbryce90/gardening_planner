import { assertEquals } from "jsr:@std/assert";

Deno.test("simple test 2", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});