#!/usr/bin/env python3
"""Generate one editable control-to-evidence flow from a small JSON object."""
import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

FIELDS = ('control', 'owner', 'evidence', 'cadence', 'reviewer')
OUTCOMES = ('pending', 'changes requested')


def valid_xml_text(text):
    return all(c in '\t\n\r' or 0x20 <= ord(c) <= 0xD7FF or
               0xE000 <= ord(c) <= 0xFFFD or 0x10000 <= ord(c) <= 0x10FFFF
               for c in text)


def generate(data):
    is_batch = isinstance(data, list)
    rows = data if is_batch else [data]
    if not 1 <= len(rows) <= 10:
        raise ValueError('input array must contain between 1 and 10 controls')
    for row in rows:
        if not isinstance(row, dict) or not set(FIELDS) <= set(row) or set(row) - set(FIELDS) - {'review_outcome'}:
            raise ValueError('each control must have: ' + ', '.join(FIELDS) + '; optional: review_outcome')
        for field in FIELDS:
            value = row[field]
            if not isinstance(value, str) or not value.strip() or not valid_xml_text(value):
                raise ValueError(f'{field} must be a non-empty string containing valid XML characters')
        if 'review_outcome' in row and row['review_outcome'] not in OUTCOMES:
            raise ValueError('review_outcome must be one of: ' + ', '.join(OUTCOMES))
    model = ET.Element('mxGraphModel', {'dx': '1000', 'dy': '500', 'grid': '1',
                                        'gridSize': '10', 'page': '1', 'pageWidth': '1169',
                                        'pageHeight': str(max(827, 220 + 120 * len(rows)))})
    root = ET.SubElement(model, 'root')
    ET.SubElement(root, 'mxCell', id='0')
    ET.SubElement(root, 'mxCell', id='1', parent='0')
    for row_index, row in enumerate(rows):
        prefix = f'r{row_index + 1}-' if is_batch else ''
        for index, (field, color) in enumerate((('control', '#d5e8d4'), ('owner', '#f5f5f5'),
                                                ('evidence', '#dae8fc'), ('reviewer', '#f5f5f5'))):
            cell = ET.SubElement(root, 'mxCell', id=prefix + field, value=f'{field.title()}: {row[field]}',
                                 style=f'rounded=1;whiteSpace=wrap;html=0;fillColor={color};', vertex='1', parent='1')
            ET.SubElement(cell, 'mxGeometry', x=str(40 + index * 240), y=str(100 + row_index * 120),
                          width='170', height='70', **{'as': 'geometry'})
        if 'review_outcome' in row:
            cell = ET.SubElement(root, 'mxCell', id=prefix + 'outcome',
                                 value=f'Review outcome: {row["review_outcome"]}',
                                 style='rounded=1;whiteSpace=wrap;html=0;fillColor=#fff2cc;', vertex='1', parent='1')
            ET.SubElement(cell, 'mxGeometry', x='990', y=str(100 + row_index * 120),
                          width='170', height='70', **{'as': 'geometry'})
        edges = [
            ('control', 'owner', 'assigned to', False),
            ('owner', 'evidence', f'produces: {row["cadence"]}', True),
            ('evidence', 'reviewer', 'reviewed by', True)]
        if 'review_outcome' in row:
            edges.append(('reviewer', 'outcome', 'records', True))
        for index, (source, target, label, dashed) in enumerate(edges, 1):
            cell = ET.SubElement(root, 'mxCell', id=f'{prefix}e{index}', value=label,
                                 style='edgeStyle=orthogonalEdgeStyle;endArrow=block;html=0;' + ('dashed=1;' if dashed else ''),
                                 edge='1', parent='1', source=prefix + source, target=prefix + target)
            ET.SubElement(cell, 'mxGeometry', relative='1', **{'as': 'geometry'})
    legend = 'Legend: solid = responsibility; dashed = evidence or review flow' if any('review_outcome' in row for row in rows) else 'Legend: solid = responsibility; dashed = evidence flow'
    cell = ET.SubElement(root, 'mxCell', id='legend', value=legend,
                         style='text;whiteSpace=wrap;html=0;', vertex='1', parent='1')
    ET.SubElement(cell, 'mxGeometry', x='40', y=str(100 + 120 * len(rows)), width='500', height='30', **{'as': 'geometry'})
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
