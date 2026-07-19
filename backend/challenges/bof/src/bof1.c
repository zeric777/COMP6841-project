#include <stdio.h>

char *gets(char *);

static void print_flag(void) {
  puts("COMP6841{A8yK5dL1}");
}

int main(void) {
  struct employee_record {
    char name[32];
    char team;
  } employee = {"", 'A'};

  puts("Employee Verification");
  printf("Employee Name: ");
  gets(employee.name);

  if (employee.team == 'B') {
    print_flag();
  } else {
    puts("Employee is not assigned to the verification team.");
  }

  return 0;
}
