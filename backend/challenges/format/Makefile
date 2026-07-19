CC := gcc
CFLAGS := -m32 -O0 -g -fno-stack-protector -fno-pie -no-pie -Wno-deprecated-declarations
LDFLAGS := -Wl,-z,norelro
BIN := bin
SRC := src

all: $(BIN)/fs1 $(BIN)/fs2 $(BIN)/fs3 $(BIN)/fs4

$(BIN):
	mkdir -p $(BIN)

$(BIN)/fs1: $(SRC)/fs1.c | $(BIN)
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)

$(BIN)/fs2: $(SRC)/fs2.c | $(BIN)
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)

$(BIN)/fs3: $(SRC)/fs3.c | $(BIN)
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)

$(BIN)/fs4: $(SRC)/fs4.c | $(BIN)
	$(CC) $(CFLAGS) $< -o $@ $(LDFLAGS)

clean:
	rm -rf $(BIN)
