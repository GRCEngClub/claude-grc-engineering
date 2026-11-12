#!/usr/bin/env python3
"""Validate the deliberately small, uncompressed mxGraph example."""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def validate(path):
    model = ET.parse(path).getroot()
    assert model.tag == 'mxGraphModel'
    root = model.find('root')
    assert root is not None
    cells = root.findall('mxCell')
    ids = [cell.get('id') for cell in cells]
    assert None not in ids and len(ids) == len(set(ids))
    by_id = {cell.get('id'): cell for cell in cells}
    assert '0' in by_id and by_id['1'].get('parent') == '0'
    for cell in cells:
        if cell.get('id') != '0':
            assert cell.get('parent') in by_id
        if cell.get('vertex') == '1':
            assert cell.find("mxGeometry[@as='geometry']") is not None
        if cell.get('edge') == '1':
            assert by_id[cell.get('source')].get('vertex') == '1'
            assert by_id[cell.get('target')].get('vertex') == '1'
            assert cell.find("mxGeometry[@as='geometry'][@relative='1']") is not None
    assert by_id['owner'].get('value') == 'Owner: Security & IT'
    assert by_id['e3'].get('value') == 'reviewed by'
    assert {(c.get('source'), c.get('target')) for c in cells if c.get('edge') == '1'} == {
        ('control', 'owner'), ('owner', 'evidence'), ('evidence', 'reviewer')}


if __name__ == '__main__':
    validate(Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name('control-evidence-flow.drawio'))
    print('Control-to-evidence structure and XML escaping: OK')
