#include <stdio.h>

char *gets(char *);

int main(void) {
  char flag[] = "COMP6841{Z4nB8qT1}";
  char input[128];

  puts("Echo Service");
  puts("Whatever you type will be echoed back.");
  printf("> ");
  gets(input);
  printf(input);
  puts("");

  return flag[0] == '\0';
}
