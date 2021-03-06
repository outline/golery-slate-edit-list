import expect from 'expect';
import fs from 'fs';
import path from 'path';
import Slate from 'slate';
import readMetadata from 'read-metadata';

import EditList from '../lib';

function deserializeValue(plugin, json) {
    const SCHEMA = Slate.Schema.create({
        plugins: [plugin]
    });

    return Slate.Value.fromJSON(
        { ...json, schema: SCHEMA },
        { normalize: false }
    );
}

describe('slate-edit-list', () => {
    const tests = fs.readdirSync(__dirname);

    tests.forEach((test, index) => {
        if (test[0] === '.' || path.extname(test).length > 0) return;
        it(test, () => {
            const plugin = EditList();

            const dir = path.resolve(__dirname, test);
            const input = readMetadata.sync(path.resolve(dir, 'input.yaml'));
            const expectedPath = path.resolve(dir, 'expected.yaml');
            const expected =
                fs.existsSync(expectedPath) && readMetadata.sync(expectedPath);

            // eslint-disable-next-line
            const runChange = require(path.resolve(dir, 'change.js')).default;

            const valueInput = deserializeValue(plugin, input);

            const newChange = runChange(plugin, valueInput.change());

            if (expected) {
                const newDocJSon = newChange.value.toJSON();
                expect(newDocJSon).toEqual(
                    deserializeValue(plugin, expected).toJSON()
                );
            }
        });
    });
});
