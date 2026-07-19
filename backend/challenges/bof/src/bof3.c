#include <stdio.h>
#include <stdlib.h>

char *gets(char *);

static void hidden_shell(void) {
  puts("Debug shell opened.");
  puts("COMP6841{J6uC3xH8}");
  exit(0);
}

static void login(void) {
  char username[32];

  printf("Username: ");
  gets(username);
  puts("Login rejected.");
}

static void backup(void) {
  puts("No backups are available for this account.");
}

int main(void) {
  char choice[8];

  puts("Backup Server");
  while (1) {
    puts("1) Login");
    puts("2) Backup");
    puts("3) Exit");
    printf("> ");

    if (!fgets(choice, sizeof(choice), stdin)) return 0;

    if (choice[0] == '1') {
      login();
    } else if (choice[0] == '2') {
      backup();
    } else if (choice[0] == '3') {
      puts("Goodbye.");
      return 0;
    } else {
      puts("Unknown option.");
    }
  }
}
