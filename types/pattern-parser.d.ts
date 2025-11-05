import { Parser } from '../types/router.d.js';
/**
 * Adapter function that converts path-to-regexp API to match the Parser interface.
 * Supports parameter constraints syntax :param(pattern) and converts wildcard '*' to '/*splat' format.
 *
 * @param route - Route pattern string
 * @param loose - If true, matches don't need to reach the end (for nested routes)
 * @returns Object with RegExp pattern and array of parameter names
 */
export declare const parsePattern: Parser;
