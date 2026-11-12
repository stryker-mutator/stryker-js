loop: for (;;) {
  continue loop;
}

outer: for (let i = 0; i < 3; i++) {
  inner: for (;;) {
    if (i > 1) continue outer;
    break inner;
  }
}

block: {
  if (foo) break block;
  bar();
}
