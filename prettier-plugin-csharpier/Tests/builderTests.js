const prettier = require("prettier");
const fs = require("fs");
const { concat, group, join, line, softline, hardline, indent } = prettier.doc.builders;

test("basic concat", () => {
    const actual = print(concat(["1", "2", "3"]));
    expect(actual).toBe("123");
});

test("concat with hardline", () => {
    const actual = print(concat(["1", hardline, "3"]));
    expect(actual).toBe("1\n3");
});

test("concat with line", () => {
    const actual = print(concat(["1", line, "3"]));
    expect(actual).toBe("1\n3");
});

test("group with line", () => {
    const actual = print(group(concat(["1", line, "3"])));
    expect(actual).toBe("1 3");
});

test("group with hardline", () => {
    const actual = print(group(concat(["1", hardline, "3"])));
    expect(actual).toBe("1\n3");
});

test("group with line and hardline", () => {
    const actual = print(group(concat(["1", line, "2", hardline, "3"])));
    expect(actual).toBe("1 2\n3");
});

test("blah2", () => {
    const doc = JSON.parse(fs.readFileSync("c:/temp/blah.json"));
    const actual = print(doc);
    expect(actual).toBe("yeah");
});

test("blah", () => {
    const doc = concat([
        concat([
            concat([
                concat([
                    concat([
                        "public"]),
                    " "]),
                "class",
                " ",
                "ClassName",
                concat([
                    hardline,
                    "{"]),
                indent(
                    concat([
                        hardline,
                        concat([
                            concat([
                                concat([
                                    concat([
                                        "public"]),
                                    " "]),
                                "void",
                                " ",
                                "DoStuff",
                                "()",
                                group(
                                    concat([
                                        hardline,
                                        "{",
                                        concat([
                                            indent(
                                                concat([
                                                    hardline,
                                                    concat([
                                                        concat([
                                                            concat([
                                                                "DoStuff",
                                                                "()"]),
                                                            ";"]),
                                                        hardline,
                                                        concat([
                                                            concat([
                                                                "DoStuff",
                                                                "()"]),
                                                            ";"])])])),
                                            hardline]),
                                        "}"]))])])])),
                hardline,
                "}"])]),
        hardline]);
    const actual = print(doc);
    expect(actual).toBe("1 2\n3");
});

test("large group concat with line", () => {
    const actual = print(group(concat(["LongTextLongTextLongTextLongText", line, "LongTextLongTextLongTextLongText", line, "LongTextLongTextLongTextLongText"])));
    expect(actual).toBe("LongTextLongTextLongTextLongText\nLongTextLongTextLongTextLongText\nLongTextLongTextLongTextLongText");
});

test("indent with hardline", () => {
    const actual = print(indent(concat([hardline, "1", hardline, "2"])));
    expect(actual).toBe("\n    1\n    2");
});

test("two indents with hardline", () => {
    const actual = print(concat([indent(concat([hardline, "11", hardline, "12"])), hardline, hardline, indent(concat([hardline, "21", hardline, "22"]))]));
    expect(actual).toBe("\n    11\n    12\n\n\n    21\n    22");
});

test("indent using", () => {
    const parts = [];
    parts.push("namespace Namespace");
    parts.push(hardline);
    parts.push("{");
    parts.push(indent(concat([hardline, "using One;", hardline, "using Two;"])));
    parts.push(hardline);
    parts.push("}");

    const actual = print(concat(parts));
    expect(actual).toBe(`namespace Namespace
{
    using One;
    using Two;
}`);
});

test("indent numbers", () => {
    const doc = group(
        concat(["[", indent(concat([hardline, join(concat([",", hardline]), ["1", "2", "3"])])), hardline, "]"]),
    );

    const actual = print(doc);
    expect(actual).toBe(`[
    1,
    2,
    3
]`);
});

test("indent argumentList", () => {
    const parts = [];
    parts.push("this.Method");
    parts.push(
        concat([
            "(",
            indent(
                concat([
                    line,
                    "lkjasdjlkfajklsdfkljasdfjklasjklfjkasdlf",
                    ",",
                    line,
                    "lkjasdlfkjajlsdfjklasdklfaksjldf",
                    ",",
                ]),
            ),
            softline,
            ")",
            ";",
        ]),
    );

    const actual = print(concat(parts));
    expect(actual).toBe(`this.Method(
    lkjasdjlkfajklsdfkljasdfjklasjklfjkasdlf,
    lkjasdlfkjajlsdfjklasdklfaksjldf,
);`);
});

function print(doc) {
    const docTree = printDocTree(doc, "");
    fs.writeFileSync("c:/temp/blah.txt", docTree);

    const result = prettier.doc.printer.printDocToString(doc, {
        tabWidth: 4,
        endOfLine: "auto",
        printWidth: 80,
    });
    return result.formatted;
}

function printDocTree(doc, indent) {
    if (typeof (doc) === "string")
    {
        return indent + "\"" + doc + "\"";
    }

    switch (doc.type)
    {
        case "concat":
            if (doc.parts.length == 2 && typeof doc.parts[1] !== "string" && doc.parts[1].type === "break-parent") {
                return indent + "hardline";
            }

            let result = indent + "concat([\r\n";
            for (let x = 0; x < doc.parts.length; x++)
            {
                result += printDocTree(doc.parts[x], indent + "    ");
                if (x < doc.parts.length - 1) {
                    result += ",\r\n";
                }
            }
            result += "])"
            return result;
        case "line":
            return indent + (doc.hard ? "hardline" : doc.soft ? "softlife" : "line");
        case "break-parent":
            return indent + "breakParent";
        case "indent":
            return indent + "indent(\r\n" + printDocTree(doc.contents, indent + "    ") + ")";
        case "group":
            return indent + "group(\r\n" + printDocTree(doc.contents, indent + "    ") + ")";
        default:
            throw new Error("Can't handle " + doc.type);
    }
}
