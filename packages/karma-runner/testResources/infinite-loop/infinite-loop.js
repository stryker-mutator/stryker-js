function loop(n, action) {
  let goOn = true;
  while(goOn) {
    action(n);
    n--;
    goOn = n > 0;
  }
}
