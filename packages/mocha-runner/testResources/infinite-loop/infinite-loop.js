function loop(n, action) {
  let goOn = true;
  while (goOn) {
    action(n);
    n--;
    goOn = n > 0;
  }
}

export default loop;
