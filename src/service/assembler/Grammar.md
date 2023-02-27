# Grammar of the micro 16 assembly language

```
Location -> "0"
          | "1"
          | "-1" | "(-1)"
          | "PC"
          | "R0"
          | "R1"
          | "R2"
          | "R3"
          | "R4"
          | "R5"
          | "R6"
          | "R7"
          | "R8"
          | "R9"
          | "R10"
          | "AC"

Operation -> Location
           | ~ Location
           | Location + Location
           | Location & Location

Function -> "lsh" | "rsh"

Expression -> Function "(" Operation ")"
            | "(" Operation ")"
            | Operation

Statement -> Location
           | Location "<-" Expression

ReadWrite -> "rw" | "rd"

Condition -> "N" | "Z"

Goto -> "if" Condition "goto" <number>
      | "goto" <number>

Instruction -> <empty>
             | Instruction Statement
             | Instruction ReadWrite
             | Instruction Goto
```
