#include <stdio.h>

char *gets(char *);
int admin = 0;

static void print_flag(void) {
  puts("COMP6841{W9cM4kD6}");
}

int main(void) {
  char input[256];

  puts("Admin Login");
  printf("Username: ");
  gets(input);
  printf(input);
  puts("");

  if (admin == 1337) {
    print_flag();
  } else {
    puts("Administrator access denied.");
  }

  return 0;
}
