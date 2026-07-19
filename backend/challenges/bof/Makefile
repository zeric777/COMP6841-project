CC := gcc
CFLAGS := -O0 -g -fno-stack-protector -fno-pie -no-pie -Wno-deprecated-declarations
BIN := bin
SRC := src

all: $(BIN)/bof1 $(BIN)/bof2 $(BIN)/bof3

$(BIN):
	mkdir -p $(BIN)

$(BIN)/bof1: $(SRC)/bof1.c | $(BIN)
	$(CC) $(CFLAGS) $< -o $@

$(BIN)/bof2: $(SRC)/bof2.c | $(BIN)
	$(CC) $(CFLAGS) $< -o $@

$(BIN)/bof3: $(SRC)/bof3.c | $(BIN)
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -rf $(BIN)
