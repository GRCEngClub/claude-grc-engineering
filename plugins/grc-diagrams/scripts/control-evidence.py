#!/usr/bin/env python3
"""Generate one editable control-to-evidence flow from a small JSON object."""
import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

FIELDS = ('control', 'owner', 'evidence', 'cadence', 'reviewer')


def valid_xml_text(text):
    return all(c in '\t\n\r' or 0x20 <= ord(c) <= 0xD7FF or
               0xE000 <= ord(c) <= 0xFFFD or 0x10000 <= ord(c) <= 0x10FFFF
               for c in text)


def generate(data):
    if not isinstance(data, dict) or set(data) != set(FIELDS):
        raise ValueError('input must be an object with exactly: ' + ', '.join(FIELDS))
    for field in FIELDS:
        value = data[field]
        if not isinstance(value, str) or not value.strip() or not valid_xml_text(value):
            raise ValueError(f'{field} must be a non-empty string containing valid XML characters')
    model = ET.Element('mxGraphModel', {'dx': '1000', 'dy': '500', 'grid': '1',
                                        'gridSize': '10', 'page': '1', 'pageWidth': '1169', 'pageHeight': '827'})
    root = ET.SubElement(model, 'root')
    ET.SubElement(root, 'mxCell', id='0')
    ET.SubElement(root, 'mxCell', id='1', parent='0')
    for index, (field, color) in enumerate((('control', '#d5e8d4'), ('owner', '#f5f5f5'),
                                            ('evidence', '#dae8fc'), ('reviewer', '#f5f5f5'))):
        cell = ET.SubElement(root, 'mxCell', id=field, value=f'{field.title()}: {data[field]}',
                             style=f'rounded=1;whiteSpace=wrap;html=0;fillColor={color};', vertex='1', parent='1')
        ET.SubElement(cell, 'mxGeometry', x=str(40 + index * 240), y='100', width='170', height='70', **{'as': 'geometry'})
    for index, (source, target, label, dashed) in enumerate((
        ('control', 'owner', 'assigned to', False),
        ('owner', 'evidence', f'produces: {data["cadence"]}', True),
        ('evidence', 'reviewer', 'reviewed by', True)), 1):
        cell = ET.SubElement(root, 'mxCell', id=f'e{index}', value=label,
                             style='edgeStyle=orthogonalEdgeStyle;endArrow=block;html=0;' + ('dashed=1;' if dashed else ''),
                             edge='1', parent='1', source=source, target=target)
        ET.SubElement(cell, 'mxGeometry', relative='1', **{'as': 'geometry'})
    cell = ET.SubElement(root, 'mxCell', id='legend', value='Legend: solid = responsibility; dashed = evidence flow',
                         style='text;whiteSpace=wrap;html=0;', vertex='1', parent='1')
    ET.SubElement(cell, 'mxGeometry', x='40', y='220', width='500', height='30', **{'as': 'geometry'})
    ET.indent(model)
    return ET.tostring(model, encoding='unicode') + '\n'


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f'duplicate field: {key}')
        result[key] = value
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path, help='UTF-8 JSON input')
    parser.add_argument('output', type=Path, help='new .drawio output (never overwritten)')
    args = parser.parse_args()
    try:
        with args.input.open(encoding='utf-8') as source:
            data = json.load(source, object_pairs_hook=unique_object)
        diagram = generate(data)
        with args.output.open('x', encoding='utf-8', newline='\n') as target:
            target.write(diagram)
    except (ValueError, OSError, UnicodeError) as error:
        print(f'error: {error}', file=sys.stderr)
        return 1
    print(f'Created {args.output}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
