export const sqliSolutions = {
  1: {
    principle:
      "The search value is concatenated into a quoted LIKE clause. A quote can terminate that string, and UNION can append a compatible three-column result set to the visible product rows.",
    steps: [
      "Use a quote and ORDER BY probes to confirm that the input changes the SQL syntax and that the original query returns three columns.",
      "Close the LIKE string, add a three-column UNION SELECT, and place the flag in the visible name column.",
      "Comment out the remaining LIKE suffix so the injected query executes cleanly.",
    ],
    exampleLabel: "Representative local payload",
    example: "' UNION SELECT 1, flag, '' FROM flags WHERE challenge = 1-- ",
    defense:
      "Bind the search value as a query parameter, for example LIKE '%' || ? || '%'. Do not expose raw database errors to the client.",
  },
  2: {
    principle:
      "Removing literal spaces and tabs does not make a concatenated SQL query safe. SQL comments and other token separators can still create valid SQL syntax.",
    steps: [
      "Confirm that ordinary UNION SELECT input is rejected because the filter only checks literal whitespace.",
      "Replace token separators with block comments so SQLite still recognises the intended keywords.",
      "Use the comment syntax to neutralise the appended LIKE suffix and return the flag through the search results.",
    ],
    exampleLabel: "Representative local payload",
    example: "'/**/UNION/**/SELECT/**/1,flag,''/**/FROM/**/flags/**/WHERE/**/challenge=2/*",
    defense:
      "Do not rely on blacklist filters. Parameterised queries remove the injection primitive regardless of whitespace, encoding, or keyword variants.",
  },
  3: {
    principle:
      "The lookup endpoint interpolates the ID into a WHERE clause but returns only whether a row exists. That response difference is still an oracle for Boolean blind SQL injection.",
    steps: [
      "Compare a known-true and known-false condition to establish the response oracle.",
      "Infer the flag length, then test one position at a time with substr() and a candidate character or ASCII comparison.",
      "Repeat the true or false tests until every character has been reconstructed.",
    ],
    exampleLabel: "Example Boolean probe",
    example: "1 AND substr((SELECT flag FROM flags WHERE challenge = 3), 1, 1) = 'C'",
    defense:
      "Treat numeric input as data: validate it as an integer and bind it through a prepared statement. Avoid response differences that reveal sensitive query state.",
  },
  4: {
    principle:
      "The login query concatenates the username and password into quoted predicates. Blocking UNION and SELECT does not prevent an attacker from ending the username string and commenting out the password check.",
    steps: [
      "Identify that the goal is to change the login predicate, not to return additional rows with UNION.",
      "Terminate the username string after admin and begin a SQL comment.",
      "The database now checks the administrator username without evaluating the supplied password predicate.",
    ],
    exampleLabel: "Username field",
    example: "admin' -- ",
    defense:
      "Use a parameterised authentication query and store passwords with a modern salted password hash. Keyword filtering is not an authentication control.",
  },
  5: {
    principle:
      "The bio is safely stored, but the export feature later concatenates that stored value into a new SQL query. This delayed execution is second-order SQL injection.",
    steps: [
      "Register and log in normally; the first stage only stores the chosen bio.",
      "Save a bio that closes the export LIKE clause and appends a compatible two-column UNION result.",
      "Run Export Users to trigger the later query and inspect the exported rows for the flag.",
    ],
    exampleLabel: "Stored bio value",
    example: "%' UNION SELECT 'flag', flag FROM flags WHERE challenge = 5--",
    defense:
      "Parameterise every query at the point it is executed, including queries that use values previously stored in the database. Safe insertion alone does not make later string interpolation safe.",
  },
};

export const xssSolutions = {
  1: {
    principle:
      "The server removes script elements but returns the remaining HTML, which React renders with dangerouslySetInnerHTML. Event handler attributes are still executable JavaScript contexts.",
    steps: [
      "Observe that the search term is reflected into the result as HTML.",
      "Use a harmless failing element with an event handler instead of a script tag.",
      "Read the lab cookie from the JavaScript execution context and submit the recovered flag.",
    ],
    exampleLabel: "Representative local payload",
    example: '<img src=x onerror="alert(document.cookie)">',
    defense:
      "Render untrusted values as text, not HTML. If rich text is required, sanitise it with a maintained allowlist and use HttpOnly cookies plus a restrictive Content Security Policy.",
  },
  2: {
    principle:
      "Comments are stored in the database and later rendered as raw HTML. The payload therefore executes for each viewer rather than only in the attacker's original request.",
    steps: [
      "Publish a compact payload that executes automatically when the comment is rendered.",
      "Use the JavaScript context to call the local report endpoint, which represents the administrator receiving the report in this lab.",
      "Read the returned flag and submit it through the challenge form.",
    ],
    exampleLabel: "Representative local payload",
    example: "<img src=x onerror=\"fetch('http://localhost:3000/api/xss/2/report',{method:'POST'}).then(r=>r.json()).then(x=>alert(x.flag))\">",
    defense:
      "Store comments as data and render them with textContent or framework escaping. If HTML support is necessary, sanitise before storage and again before rendering, then enforce a strict Content Security Policy.",
  },
  3: {
    principle:
      "The browser reads location.hash, decodes it, and writes it to innerHTML. The fragment never reaches the server, so server-side filtering cannot protect this DOM XSS sink.",
    steps: [
      "Inspect the client-side code and trace the value from location.hash to innerHTML.",
      "Place HTML with an event handler in the fragment; URL encoding keeps the value valid in the address bar.",
      "The handler runs in the page context and can read the challenge secret exposed on window.",
    ],
    exampleLabel: "Example profile fragment",
    example: "/xss/3#%3Cimg%20src%3Dx%20onerror%3D%22alert(window.xssDomSecret)%22%3E",
    defense:
      "Use textContent for a display name or build DOM nodes with safe APIs. Treat client-side URL values as untrusted input and avoid innerHTML for them.",
  },
};

export const bofSolutions = {
  1: {
    principle:
      "The employee record places name[32] immediately before the team byte, and gets() performs no bounds checking. Input beyond the name array overwrites the adjacent field.",
    steps: [
      "Inspect the source or stack layout to confirm that team follows the 32-byte name field.",
      "Fill exactly 32 bytes to reach the next byte in the record.",
      "Write B as the following byte so the team comparison passes and the program calls print_flag().",
    ],
    exampleLabel: "Representative local input",
    example: "python3 -c \"print('A' * 32 + 'B')\" | ./bof1",
    defense:
      "Replace gets() with a bounded input API such as fgets(), keep explicit length checks, and enable compiler protections such as stack canaries and fortification.",
  },
  2: {
    principle:
      "The vulnerable login() function stores a 32-byte buffer in its stack frame. Overflowing past the saved frame pointer reaches the saved return address, allowing execution to return to win().",
    steps: [
      "Locate the unreferenced win() symbol with nm, objdump, or gdb.",
      "Use a cyclic pattern or debugger to confirm the 40-byte offset to the saved return address.",
      "Send 40 padding bytes followed by the little-endian address of win().",
    ],
    exampleLabel: "Payload structure",
    example: "b'A' * 40 + p64(WIN_ADDRESS)",
    defense:
      "Use bounded input handling and enable stack canaries, PIE, ASLR, and control-flow protections. Remove debug-only functions from production binaries.",
  },
  3: {
    principle:
      "The menu does not expose hidden_shell(), but the function remains in the binary. The login buffer overflow can replace login()'s saved return address with that hidden function's address.",
    steps: [
      "Choose Login, then inspect the binary with strings, nm, objdump, or gdb to find hidden_shell().",
      "Determine the return-address offset in login(), which is 40 bytes for this exercise.",
      "Supply the menu choice followed by an overflow payload whose return address targets hidden_shell().",
    ],
    exampleLabel: "Payload structure after choosing Login",
    example: "b'A' * 40 + p64(HIDDEN_SHELL_ADDRESS)",
    defense:
      "Do not ship unused administrative or debug functions. Combine code removal with bounded input routines and modern binary hardening.",
  },
};

export const formatSolutions = {
  1: {
    principle:
      "printf(input) treats attacker-controlled input as a format string. Each %x conversion reads another machine word from the stack, including bytes from the local flag buffer.",
    steps: [
      "Send repeated %x conversions to walk stack values exposed to printf().",
      "Identify hexadecimal words that represent printable ASCII data from the local flag buffer.",
      "Reverse the byte order within each 32-bit word to read the little-endian flag text.",
    ],
    exampleLabel: "Stack-leak probe",
    example: "%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x.%x",
    defense:
      "Use a constant format string, such as printf(\"%s\", input), and compile with format-string warnings treated as errors.",
  },
  2: {
    principle:
      "The vulnerable function leaves a pointer to the password on the stack. After identifying its position with numeric leaks, %n$s asks printf() to dereference that stack argument as a string pointer.",
    steps: [
      "Probe stack positions with numbered hexadecimal conversions and look for a value that resembles a valid pointer.",
      "Replace the conversion at that position with a positional string conversion, such as %7$s.",
      "Adjust the index until printf() dereferences the password pointer and prints the secret.",
    ],
    exampleLabel: "Positional string read",
    example: "AAAA.%1$x.%2$x.%3$x.%4$x.%5$x.%6$x.%7$s",
    defense:
      "Never pass user input as the format parameter. Use printf(\"%s\", input) and keep sensitive values out of unnecessarily long-lived stack frames.",
  },
  3: {
    principle:
      "The %n conversion writes the number of characters printed so far to an address supplied through the format string argument list. With the address of admin on the stack, output length becomes a write primitive.",
    steps: [
      "Find the fixed admin address and the stack position at which your input-controlled address is interpreted.",
      "Create padding that makes printf() produce 1337 characters before the %n conversion.",
      "Use %n to write 1337 to admin, then let the program take its success branch.",
    ],
    exampleLabel: "Pwntools payload pattern",
    example: "fmtstr_payload(INDEX, {ADMIN_ADDRESS: 1337}, write_size='byte')",
    defense:
      "Use fixed format strings and enable compiler format checks. Do not expose writable globals through attacker-controlled output, and use least-privilege process design.",
  },
  4: {
    principle:
      "The writable puts GOT entry determines the address called by a later puts() invocation. A format-string write can replace that entry with win(), turning the next normal output call into a control-flow transfer.",
    steps: [
      "Locate puts@GOT with readelf or objdump and locate win() in the symbol table.",
      "Find the format-string argument index using a marker probe.",
      "Use controlled partial writes, commonly %hn, to replace the GOT entry with the win() address before puts() executes.",
    ],
    exampleLabel: "Pwntools payload pattern",
    example: "fmtstr_payload(INDEX, {PUTS_GOT: WIN_ADDRESS}, write_size='short')",
    defense:
      "Use fixed format strings and enable full RELRO so the GOT is read-only after relocation. Combine PIE, ASLR, and modern compiler hardening in production builds.",
  },
};
