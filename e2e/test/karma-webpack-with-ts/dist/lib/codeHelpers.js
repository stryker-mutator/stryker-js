export function pathJoin(...parts) {
    return parts.reduce((prev, current) => (prev.length ? (current ? `${prev}/${current}` : prev) : current), '');
}
//# sourceMappingURL=codeHelpers.js.map