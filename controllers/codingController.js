const { evaluateCodingSolution } = require('../utils/claudeService');

const CODING_PROBLEMS = {
    easy: [
        {
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume exactly one solution exists.',
            examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
            testCases: [
                { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
                { input: '[3,2,4], 6', expectedOutput: '[1,2]' }
            ]
        },
        {
            title: 'Palindrome Check',
            description: 'Write a function that checks if a given string is a palindrome (reads the same forwards and backwards). Ignore case and non-alphanumeric characters.',
            examples: [{ input: '"racecar"', output: 'true' }, { input: '"hello"', output: 'false' }],
            testCases: [
                { input: '"racecar"', expectedOutput: 'true' },
                { input: '"hello"', expectedOutput: 'false' },
                { input: '"A man a plan a canal Panama"', expectedOutput: 'true' }
            ]
        }
    ],
    medium: [
        {
            title: 'Longest Substring Without Repeating Characters',
            description: 'Given a string s, find the length of the longest substring without repeating characters.',
            examples: [{ input: '"abcabcbb"', output: '3 (abc)' }],
            testCases: [
                { input: '"abcabcbb"', expectedOutput: '3' },
                { input: '"bbbbb"', expectedOutput: '1' },
                { input: '"pwwkew"', expectedOutput: '3' }
            ]
        },
        {
            title: 'Valid Parentheses',
            description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid. An input string is valid if brackets are closed in the correct order.',
            examples: [{ input: '"()[]{}"', output: 'true' }, { input: '"(]"', output: 'false' }],
            testCases: [
                { input: '"()[]{}"', expectedOutput: 'true' },
                { input: '"(]"', expectedOutput: 'false' },
                { input: '"{[]}"', expectedOutput: 'true' }
            ]
        }
    ],
    hard: [
        {
            title: 'Merge K Sorted Lists',
            description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it. For simplicity, work with arrays of sorted numbers.',
            examples: [{ input: '[[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }],
            testCases: [
                { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]' },
                { input: '[]', expectedOutput: '[]' }
            ]
        }
    ]
};

const getCodingProblem = async (req, res, next) => {
    try {
        const level = req.params.level || 'medium';
        const problems = CODING_PROBLEMS[level] || CODING_PROBLEMS.medium;
        const problem = problems[Math.floor(Math.random() * problems.length)];
        res.json({ success: true, problem });
    } catch (error) { next(error); }
};

const evaluateSolution = async (req, res, next) => {
    try {
        const { problem, solution, testCases, interviewId } = req.body;
        if (!solution) return res.status(400).json({ success: false, message: 'Solution code is required' });

        const result = await evaluateCodingSolution({ problem, solution, testCases: testCases || [] });
        res.json({ success: true, result });
    } catch (error) { next(error); }
};

module.exports = { getCodingProblem, evaluateSolution };
