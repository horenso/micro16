export function assembleLine(line: string): number {
    if (line === "") {
        return 0;
    }
    let result = 0;
    let readWrite = false;
    let tokens = line.split(' ')
    for (let token of tokens) {
        if (token === "rd" || token === "wr") {
            if (readWrite) {
                return 0xbad; // Error: only one read/write permitted
            }
            readWrite = true;
            if (token === "rd") {
                result |= 0x600000;
            } else {
                result |= 0x200000;                ;
            }
        }
    }
    console.log(tokens, result);
    return result;
}

