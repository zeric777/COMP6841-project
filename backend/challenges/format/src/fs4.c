#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

char *gets(char *);

static void win(void) {
  const char flag[] = "COMP6841{H3sX7aN2}\n";
  write(STDOUT_FILENO, flag, sizeof(flag) - 1);
  exit(0);
}

static void vulnerable_echo(void) {
  char input[256];

  printf("Input: ");
  gets(input);
  printf(input);
  puts("Bye");
}

int main(void) {
  puts("System Utility");
  vulnerable_echo();
  return 0;
}
