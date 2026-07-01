#!/usr/bin/env node

import fs from 'node:fs';

const [, , inputPath] = process.argv;
const failures = [];

if (!inputPath && process.stdin.isTTY) {
  console.log(JSON.stringify({
    pass: false,
    failures: ['usage: npm run qa:note -- path/to/note.json'],
  }, null, 2));
  process.exit(1);
}

let raw;
try {
  raw = inputPath ? fs.readFileSync(inputPath, 'utf8') : fs.readFileSync(0, 'utf8');
} catch (error) {
  console.log(JSON.stringify({
    pass: false,
    failures: [`unable to read input: ${error instanceof Error ? error.message : 'unknown error'}`],
  }, null, 2));
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(raw);
} catch {
  console.log(JSON.stringify({ pass: false, failures: ['invalid JSON'] }, null, 2));
  process.exit(1);
}

const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const list = (value) => Array.isArray(value) ? value.filter(text) : [];

if (!isRecord(payload)) {
  console.log(JSON.stringify({ pass: false, failures: ['note artifact must be an object'] }, null, 2));
  process.exit(1);
}

const note = payload.noteData || payload.note || payload;
if (!isRecord(note)) {
  console.log(JSON.stringify({ pass: false, failures: ['note artifact missing note data'] }, null, 2));
  process.exit(1);
}

const method = payload.method || payload.metadata?.method || note.method || note.metadata?.method;

if (!text(note.fullSummary) || note.fullSummary.trim().length < 80) {
  failures.push('fullSummary must explain the whole video in enough depth');
}

const segments = Array.isArray(note.segments) ? note.segments : [];
if (segments.length === 0) {
  failures.push('segments must contain at least one learning segment');
}

const commonFields = ['learningObjective', 'methodExplanation', 'checkQuestion', 'practiceTask'];
const methodFields = {
  'Feynman Technique': ['coreConcept', 'simpleExplanation', 'everydayAnalogy', 'knowledgeGaps', 'selfExplanationTest'],
  "ELI5 (Explain Like I'm 5)": ['kidFriendlyExplanation', 'familiarExample', 'sayItBack'],
  'Cornell Method': ['cueQuestion', 'noteBody', 'summarySentence'],
  'Mind Map': ['centerConcept', 'branches', 'mermaidCode'],
  'Socratic Method': ['guidingQuestion', 'followUpQuestions', 'tentativeAnswer'],
  Analogy: ['analogySource', 'analogyMapping', 'analogyLimit'],
  Storytelling: ['storyScene', 'storyConflict', 'storyLesson'],
};
const supportedMethods = ['Custom', ...Object.keys(methodFields)];

if (!text(method)) {
  failures.push('method is required');
} else if (method !== 'Custom' && !methodFields[method]) {
  failures.push(`unknown method ${method}; qa:note validates active /note methods only: ${supportedMethods.join(', ')}`);
}

for (const [index, segment] of segments.entries()) {
  if (!isRecord(segment)) {
    failures.push(`segment ${index + 1} must be an object`);
    continue;
  }
  if (!text(segment.title)) failures.push(`segment ${index + 1} missing title`);
  if (!text(segment.summary) || segment.summary.trim().length < 40) {
    failures.push(`segment ${index + 1} summary too shallow`);
  }
  if (!Number.isFinite(segment.start) || !Number.isFinite(segment.end) || segment.end <= segment.start) {
    failures.push(`segment ${index + 1} must have valid start/end timestamps`);
  }
  if (list(segment.keyPoints).length === 0) failures.push(`segment ${index + 1} missing keyPoints`);

  for (const field of commonFields) {
    if (!text(segment[field])) failures.push(`segment ${index + 1} missing ${field}`);
  }

  for (const field of methodFields[method] || []) {
    const value = segment[field];
    if (Array.isArray(value) ? list(value).length === 0 : !text(value)) {
      failures.push(`segment ${index + 1} missing ${method} field ${field}`);
    }
  }
}

const insights = note.insights || {};
if (list(insights.mainTakeaways).length === 0) failures.push('insights.mainTakeaways is required');
if (list(insights.thinkingQuestions).length === 0) failures.push('insights.thinkingQuestions is required');

console.log(JSON.stringify({
  pass: failures.length === 0,
  method,
  segmentCount: segments.length,
  failures,
}, null, 2));

process.exit(failures.length === 0 ? 0 : 1);
