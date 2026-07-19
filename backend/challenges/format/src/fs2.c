#include <stdio.h>

char *gets(char *);

int main(void) {
  char password[] = "COMP6841{E7pL2vR5}";
  char *password_reference = password;
  char input[128];

  puts("Authentication Server");
  printf("Echo: ");
  gets(input);
  printf(input);
  puts("");

  return password_reference[0] == '\0';
}
