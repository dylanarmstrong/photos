/*
fd -t f '\.(jpeg|avif|webp)$' > files
cat files | sort -t'/' -k1,1 -k2V | ag '_w320\.jpeg$' | sed -e 's/_w320\.jpeg$//g' > sorted
python3 -c "import json; print(json.dumps(open('sorted').read().splitlines(), indent=2))" > sorted.json
*/
import { readFileSync } from 'node:fs';

// Very simple file, just ['album/file1', 'album/file2', ...]
const sorted: string[] = JSON.parse(readFileSync('../../sorted.json', 'utf8'));

export { sorted };
