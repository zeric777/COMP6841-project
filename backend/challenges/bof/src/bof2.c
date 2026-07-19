#include <stdio.h>

char *gets(char *);

static void win(void) {
  puts("COMP6841{P2rF7mW9}");
}

static void login(void) {
  char password[32];

  printf("Password: ");
  gets(password);
  puts("Login failed.");
}

int main(void) {
  puts("Binary Login");
  login();
  return 0;
}
