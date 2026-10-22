/**
 * NeetCode 150 & Blind 75 Canonical DSA Curriculum Data
 * Complete 18-Track Algorithmic Patterns with Voice Intuitions & Runnable Tests
 */
window.NEETCODE_CURRICULUM = [
  {
    id: "arrays_hashing",
    name: "Arrays & Hashing",
    icon: "⚡",
    count: "15 questions",
    badge: "NeetCode Core",
    timeComp: "O(n) / O(1)",
    spaceComp: "O(n) auxiliary",
    mentalModel: "Trade space for instant O(1) lookup",
    prose: "Arrays provide contiguous block storage with instant O(1) indexing, but O(n) insertions. Hash tables compute integer hashes to map keys to buckets, turning linear scans into amortized constant-time searches.",
    analogy: "A coat-check desk: instead of searching 500 coats sequentially, your claim ticket directly indexes the exact rack number instantly.",
    key_points: {
      pattern: "When searching for complement pairs (target - x) or detecting duplicates, store seen values in a Hash Map / Set to achieve O(n) total time.",
      edgeCases: "Empty input, no valid complement pair, duplicate numbers that must be reused vs prohibited from reuse.",
      pitfalls: "Assuming hash table operations are always strictly O(1); adversarial hash collisions can degrade lookups to O(n).",
      faang: "What if available memory is strictly O(1)? Sort the array in O(n log n) and apply the Two Pointers technique."
    },
    examples: {
      easy: {
        title: "Two Sum",
        badge: "NeetCode 150 #1",
        desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        pythonCode: `def twoSum(nums, target):
    seen = {}  # val -> index
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
        jsCode: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) {
            return [seen.get(diff), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
        walkthrough: "We traverse the list once. At each step, we compute `target - num` and check our hash map in O(1) time. Total runtime: O(n), auxiliary space: O(n)."
      },
      medium: {
        title: "Group Anagrams",
        badge: "NeetCode 150 #49",
        desc: "Given an array of strings strs, group the anagrams together in any order.",
        pythonCode: `from collections import defaultdict

def groupAnagrams(strs):
    ans = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        ans[tuple(count)].append(s)
    return list(ans.values())`,
        jsCode: `function groupAnagrams(strs) {
    const map = {};
    for (const s of strs) {
        const count = new Array(26).fill(0);
        for (const c of s) count[c.charCodeAt(0) - 97]++;
        const key = count.join('#');
        if (!map[key]) map[key] = [];
        map[key].push(s);
    }
    return Object.values(map);
}`,
        walkthrough: "Instead of sorting each string in O(k log k), we hash by character frequency tuple in O(k). Total time: O(n * k)."
      },
      hard: {
        title: "Longest Consecutive Sequence",
        badge: "NeetCode 150 #128",
        desc: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence in O(n) time.",
        pythonCode: `def longestConsecutive(nums):
    num_set = set(nums)
    longest = 0
    for num in num_set:
        # Only start counting if num is the beginning of a sequence
        if (num - 1) not in num_set:
            length = 1
            while (num + length) in num_set:
                length += 1
            longest = max(longest, length)
    return longest`,
        jsCode: `function longestConsecutive(nums) {
    const set = new Set(nums);
    let longest = 0;
    for (const num of set) {
        if (!set.has(num - 1)) {
            let length = 1;
            while (set.has(num + length)) length++;
            longest = Math.max(longest, length);
        }
    }
    return longest;
}`,
        walkthrough: "By only starting streaks when `num - 1` is not present, each number is visited at most twice. Total time: O(n) with O(n) space."
      }
    },
    practice: {
      easy: {
        title: "Two Sum",
        badge: "NeetCode 150 #1",
        prompt: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        sampleIo: "Input: nums = [2,7,11,15], target = 9 → Output: [0,1]",
        starterCodePython: `def twoSum(nums, target):
    # Your solution here:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        starterCodeJs: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) return [seen.get(diff), i];
        seen.set(nums[i], i);
    }
    return [];
}`,
        solutionCode: `def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i
    return []`,
        complexityNotes: "Time: O(n) single pass | Space: O(n) hash map storage",
        hints: [
          "Can you check if (target - current_number) was already encountered?",
          "Use a hash map to store each number and its index as you iterate."
        ],
        testCases: [
          { input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]", desc: "Basic positive integers" },
          { input: "nums = [3,2,4], target = 6", expected: "[1, 2]", desc: "Non-adjacent pair" },
          { input: "nums = [3,3], target = 6", expected: "[0, 1]", desc: "Duplicate values" }
        ]
      },
      medium: {
        title: "Group Anagrams",
        badge: "NeetCode 150 #49",
        prompt: "Given an array of strings strs, group all anagrams together into sublists.",
        sampleIo: "Input: strs = ['eat','tea','tan','ate','nat','bat'] → Output: [['eat','tea','ate'],['tan','nat'],['bat']]",
        starterCodePython: `from collections import defaultdict

def groupAnagrams(strs):
    ans = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        ans[key].append(s)
    return list(ans.values())`,
        solutionCode: `from collections import defaultdict
def groupAnagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        count = [0] * 26
        for c in s: count[ord(c) - 97] += 1
        groups[tuple(count)].append(s)
    return list(groups.values())`,
        complexityNotes: "Time: O(n * k) with frequency array | Space: O(n * k)",
        hints: [
          "Two words are anagrams if and only if their sorted strings or character frequency counts are identical."
        ],
        testCases: [
          { input: "strs = ['eat','tea','tan','ate','nat','bat']", expected: "3 groups", desc: "Standard anagram clusters" },
          { input: "strs = ['']", expected: "[['']]", desc: "Single empty string" },
          { input: "strs = ['a']", expected: "[['a']]", desc: "Single character string" }
        ]
      },
      hard: {
        title: "Longest Consecutive Sequence",
        badge: "NeetCode 150 #128",
        prompt: "Given unsorted integers nums, find the length of the longest consecutive sequence in O(n) time.",
        sampleIo: "Input: nums = [100,4,200,1,3,2] → Output: 4 (sequence: [1,2,3,4])",
        starterCodePython: `def longestConsecutive(nums):
    num_set = set(nums)
    longest = 0
    for num in num_set:
        if (num - 1) not in num_set:
            streak = 1
            while (num + streak) in num_set:
                streak += 1
            longest = max(longest, streak)
    return longest`,
        solutionCode: `def longestConsecutive(nums):
    num_set = set(nums)
    best = 0
    for n in num_set:
        if (n - 1) not in num_set:
            curr = n
            streak = 1
            while (curr + 1) in num_set:
                curr += 1
                streak += 1
            best = max(best, streak)
    return best`,
        complexityNotes: "Time: O(n) amortized | Space: O(n) set overhead",
        hints: [
          "How can you check if a number is the TRUE start of a streak?",
          "Only start expanding when `num - 1` does NOT exist in the set."
        ],
        testCases: [
          { input: "nums = [100,4,200,1,3,2]", expected: "4", desc: "Scattered 4-element streak" },
          { input: "nums = [0,3,7,2,5,8,4,6,0,1]", expected: "9", desc: "Long 0 through 8 streak" },
          { input: "nums = []", expected: "0", desc: "Empty array" }
        ]
      }
    }
  },
  {
    id: "two_pointers",
    name: "Two Pointers",
    icon: "↔️",
    count: "12 questions",
    badge: "NeetCode Core",
    timeComp: "O(n)",
    spaceComp: "O(1) auxiliary",
    mentalModel: "Inward or outward converging indices on sorted sequences",
    prose: "Two pointers move symmetrically or at variable speeds across arrays or strings to verify palindromes, search pairs, or partition items without extra memory allocations.",
    analogy: "Two friends walking toward each other from opposite sides of a suspension bridge to find a matching meeting point.",
    key_points: {
      pattern: "Sorted array search, reversing sequences, in-place deduplication, and palindrome validation.",
      edgeCases: "Empty strings, odd vs even length strings, punctuation-only inputs, multiple matching pairs.",
      pitfalls: "Pointer crossover / off-by-one errors (using `left < right` vs `left <= right`).",
      faang: "How to avoid duplicate triplets in 3Sum? (Sort array, skip identical consecutive elements for both anchor and inner pointers)."
    },
    examples: {
      easy: {
        title: "Valid Palindrome",
        badge: "NeetCode 150 #125",
        desc: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
        pythonCode: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum(): l += 1
        while l < r and not s[r].isalnum(): r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
        jsCode: `function isPalindrome(s) {
    let l = 0, r = s.length - 1;
    while (l < r) {
        while (l < r && !/[a-zA-Z0-9]/.test(s[l])) l++;
        while (l < r && !/[a-zA-Z0-9]/.test(s[r])) r--;
        if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
        l++; r--;
    }
    return true;
}`,
        walkthrough: "In-place two pointer traversal avoids creating a sanitized copy string, achieving O(n) runtime with strictly O(1) extra space."
      },
      medium: {
        title: "3Sum",
        badge: "NeetCode 150 #15",
        desc: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
        pythonCode: `def threeSum(nums):
    res = []
    nums.sort()
    for i, a in enumerate(nums):
        if a > 0: break
        if i > 0 and a == nums[i - 1]: continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            three_sum = a + nums[l] + nums[r]
            if three_sum > 0: r -= 1
            elif three_sum < 0: l += 1
            else:
                res.append([a, nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]: l += 1
    return res`,
        jsCode: `function threeSum(nums) {
    const res = [];
    nums.sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = nums.length - 1;
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r];
            if (sum > 0) r--;
            else if (sum < 0) l++;
            else {
                res.push([nums[i], nums[l], nums[r]]);
                l++; r--;
                while (l < r && nums[l] === nums[l - 1]) l++;
            }
        }
    }
    return res;
}`,
        walkthrough: "Sorting takes O(n log n). Fixing the first number and scanning with two pointers takes O(n^2). Duplicate triplets are pruned by skipping duplicates."
      },
      hard: {
        title: "Trapping Rain Water",
        badge: "NeetCode 150 #42",
        desc: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        pythonCode: `def trap(height):
    if not height: return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]
    return water`,
        jsCode: `function trap(height) {
    if (!height.length) return 0;
    let l = 0, r = height.length - 1;
    let leftMax = height[l], rightMax = height[r], water = 0;
    while (l < r) {
        if (leftMax < rightMax) {
            l++;
            leftMax = Math.max(leftMax, height[l]);
            water += leftMax - height[l];
        } else {
            r--;
            rightMax = Math.max(rightMax, height[r]);
            water += rightMax - height[r];
        }
    }
    return water;
}`,
        walkthrough: "The trapped water over any bar is strictly bounded by the minimum of maximum heights on its left and right. Moving the pointer with smaller max bounds yields O(n) time and O(1) space."
      }
    },
    practice: {
      easy: {
        title: "Valid Palindrome",
        badge: "NeetCode 150 #125",
        prompt: "Verify if string s reads the same forward and backward after ignoring casing and non-alphanumeric characters.",
        sampleIo: "Input: s = 'A man, a plan, a canal: Panama' → Output: true",
        starterCodePython: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum(): l += 1
        while l < r and not s[r].isalnum(): r -= 1
        if s[l].lower() != s[r].lower(): return False
        l += 1
        r -= 1
    return True`,
        solutionCode: `def isPalindrome(s):
    clean = [c.lower() for c in s if c.isalnum()]
    return clean == clean[::-1]`,
        complexityNotes: "Time: O(n) | Space: O(1) with pointers",
        hints: ["Use two pointers moving inward, skipping any non-alphanumeric characters."],
        testCases: [
          { input: "s = 'A man, a plan, a canal: Panama'", expected: "true", desc: "Classic Panama palindrome" },
          { input: "s = 'race a car'", expected: "false", desc: "Non-palindrome" },
          { input: "s = ' '", expected: "true", desc: "Empty alphanumeric string" }
        ]
      },
      medium: {
        title: "Two Sum II - Input Array Is Sorted",
        badge: "NeetCode 150 #167",
        prompt: "Given a 1-indexed sorted array numbers and integer target, find two numbers that sum to target.",
        sampleIo: "Input: numbers = [2,7,11,15], target = 9 → Output: [1,2]",
        starterCodePython: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        cur = numbers[l] + numbers[r]
        if cur == target: return [l + 1, r + 1]
        elif cur < target: l += 1
        else: r -= 1
    return []`,
        solutionCode: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target: return [l + 1, r + 1]
        if s < target: l += 1
        else: r -= 1
    return []`,
        complexityNotes: "Time: O(n) | Space: O(1) auxiliary",
        hints: ["Since the array is sorted, moving the left pointer increases the sum; moving the right decreases it."],
        testCases: [
          { input: "numbers = [2,7,11,15], target = 9", expected: "[1, 2]", desc: "First two elements" },
          { input: "numbers = [2,3,4], target = 6", expected: "[1, 3]", desc: "Ends sum to target" }
        ]
      },
      hard: {
        title: "Trapping Rain Water",
        badge: "NeetCode 150 #42",
        prompt: "Compute how much water an elevation map can trap after raining.",
        sampleIo: "Input: height = [0,1,0,2,1,0,1,3,2,1,2,1] → Output: 6",
        starterCodePython: `def trap(height):
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    res = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            res += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            res += right_max - height[r]
    return res`,
        solutionCode: `def trap(height):
    l, r = 0, len(height) - 1
    l_max, r_max = height[l], height[r]
    ans = 0
    while l < r:
        if l_max < r_max:
            l += 1
            l_max = max(l_max, height[l])
            ans += l_max - height[l]
        else:
            r -= 1
            r_max = max(r_max, height[r])
            ans += r_max - height[r]
    return ans`,
        complexityNotes: "Time: O(n) | Space: O(1) optimal",
        hints: ["Track left_max and right_max, and advance whichever boundary is shorter."],
        testCases: [
          { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", expected: "6", desc: "Canonical LeetCode terrain" },
          { input: "height = [4,2,0,3,2,5]", expected: "9", desc: "Valley between tall towers" }
        ]
      }
    }
  },
  {
    id: "sliding_window",
    name: "Sliding Window",
    icon: "🪟",
    count: "10 questions",
    badge: "NeetCode Core",
    timeComp: "O(n) amortized",
    spaceComp: "O(k) frequency map",
    mentalModel: "Expand right to satisfy condition; contract left to minimize/maximize window",
    prose: "Sliding Window maintains a contiguous subsegment of elements, dynamically growing the right boundary to find candidates and shrinking the left boundary to restore valid invariant states.",
    analogy: "A sliding viewport or camera lens that zooms out when it needs more context and zooms in when boundaries are exceeded.",
    key_points: {
      pattern: "Contiguous subarrays/substrings seeking maximum length, minimum length, or target match counts.",
      edgeCases: "Empty strings, window size exceeding input array length, strings with identical repeating characters.",
      pitfalls: "Resetting the left pointer back to 0 instead of advancing it monotonically (which breaks the linear O(n) time guarantee).",
      faang: "Minimum Window Substring: how to achieve O(s + t) time without repeated map comparisons? (Use a `have == need` counter variable)."
    },
    examples: {
      easy: {
        title: "Best Time to Buy and Sell Stock",
        badge: "NeetCode 150 #121",
        desc: "You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
        pythonCode: `def maxProfit(prices):
    min_price = float('inf')
    max_p = 0
    for p in prices:
        if p < min_price: min_price = p
        elif p - min_price > max_p: max_p = p - min_price
    return max_p`,
        jsCode: `function maxProfit(prices) {
    let minPrice = Infinity, maxP = 0;
    for (const p of prices) {
        if (p < minPrice) minPrice = p;
        else if (p - minPrice > maxP) maxP = p - minPrice;
    }
    return maxP;
}`,
        walkthrough: "We track the minimum buying price seen so far and compare today's profit in a single linear pass in O(n) time and O(1) space."
      },
      medium: {
        title: "Longest Substring Without Repeating Characters",
        badge: "NeetCode 150 #3",
        desc: "Given a string s, find the length of the longest substring without repeating characters.",
        pythonCode: `def lengthOfLongestSubstring(s):
    char_set = set()
    l = 0
    res = 0
    for r in range(len(s)):
        while s[r] in char_set:
            char_set.remove(s[l])
            l += 1
        char_set.add(s[r])
        res = max(res, r - l + 1)
    return res`,
        jsCode: `function lengthOfLongestSubstring(s) {
    const set = new Set();
    let l = 0, res = 0;
    for (let r = 0; r < s.length; r++) {
        while (set.has(s[r])) {
            set.delete(s[l]);
            l++;
        }
        set.add(s[r]);
        res = Math.max(res, r - l + 1);
    }
    return res;
}`,
        walkthrough: "When a duplicate character appears at index r, we shrink the window from the left until the duplicate is dropped. Both pointers traverse at most n steps -> O(n) total."
      },
      hard: {
        title: "Minimum Window Substring",
        badge: "NeetCode 150 #76",
        desc: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
        pythonCode: `def minWindow(s, t):
    if not t or not s: return ""
    count_t, window = {}, {}
    for c in t: count_t[c] = 1 + count_t.get(c, 0)
    have, need = 0, len(count_t)
    res, res_len = [-1, -1], float("inf")
    l = 0
    for r in range(len(s)):
        c = s[r]
        window[c] = 1 + window.get(c, 0)
        if c in count_t and window[c] == count_t[c]:
            have += 1
        while have == need:
            if (r - l + 1) < res_len:
                res = [l, r]
                res_len = r - l + 1
            window[s[l]] -= 1
            if s[l] in count_t and window[s[l]] < count_t[s[l]]:
                have -= 1
            l += 1
    l, r = res
    return s[l:r + 1] if res_len != float("inf") else ""`,
        jsCode: `function minWindow(s, t) {
    if (!t || !s) return "";
    const countT = {}, window = {};
    for (const c of t) countT[c] = (countT[c] || 0) + 1;
    let have = 0, need = Object.keys(countT).length;
    let res = [-1, -1], resLen = Infinity, l = 0;
    for (let r = 0; r < s.length; r++) {
        const c = s[r];
        window[c] = (window[c] || 0) + 1;
        if (countT[c] && window[c] === countT[c]) have++;
        while (have === need) {
            if ((r - l + 1) < resLen) {
                res = [l, r];
                resLen = r - l + 1;
            }
            window[s[l]]--;
            if (countT[s[l]] && window[s[l]] < countT[s[l]]) have--;
            l++;
        }
    }
    return resLen === Infinity ? "" : s.slice(res[0], res[1] + 1);
}`,
        walkthrough: "We expand right until all target characters are matched (`have == need`). Then shrink left to minimize the window. Runtime: O(m + n)."
      }
    },
    practice: {
      easy: {
        title: "Best Time to Buy & Sell Stock",
        badge: "NeetCode 150 #121",
        prompt: "Find the maximum profit achievable by buying on one day and selling on a subsequent day.",
        sampleIo: "Input: prices = [7,1,5,3,6,4] → Output: 5 (buy at 1, sell at 6)",
        starterCodePython: `def maxProfit(prices):
    min_price = float('inf')
    max_p = 0
    for p in prices:
        if p < min_price: min_price = p
        elif p - min_price > max_p: max_p = p - min_price
    return max_p`,
        solutionCode: `def maxProfit(prices):
    min_p, max_profit = float('inf'), 0
    for p in prices:
        min_p = min(min_p, p)
        max_profit = max(max_profit, p - min_p)
    return max_profit`,
        complexityNotes: "Time: O(n) | Space: O(1)",
        hints: ["Keep track of the minimum buy price seen up to the current day."],
        testCases: [
          { input: "prices = [7,1,5,3,6,4]", expected: "5", desc: "Standard fluctuating prices" },
          { input: "prices = [7,6,4,3,1]", expected: "0", desc: "Strictly decreasing prices" }
        ]
      },
      medium: {
        title: "Longest Substring Without Repeating",
        badge: "NeetCode 150 #3",
        prompt: "Return the length of the longest substring containing no duplicate characters.",
        sampleIo: "Input: s = 'abcabcbb' → Output: 3 ('abc')",
        starterCodePython: `def lengthOfLongestSubstring(s):
    seen = set()
    l, ans = 0, 0
    for r in range(len(s)):
        while s[r] in seen:
            seen.remove(s[l])
            l += 1
        seen.add(s[r])
        ans = max(ans, r - l + 1)
    return ans`,
        solutionCode: `def lengthOfLongestSubstring(s):
    seen = {}
    l, ans = 0, 0
    for r, c in enumerate(s):
        if c in seen and seen[c] >= l:
            l = seen[c] + 1
        seen[c] = r
        ans = max(ans, r - l + 1)
    return ans`,
        complexityNotes: "Time: O(n) | Space: O(min(m, n))",
        hints: ["Maintain a window set and shrink from the left when the right character is already present."],
        testCases: [
          { input: "s = 'abcabcbb'", expected: "3", desc: "Repeated patterns" },
          { input: "s = 'bbbbb'", expected: "1", desc: "All identical characters" },
          { input: "s = 'pwwkew'", expected: "3", desc: "Substring 'wke'" }
        ]
      },
      hard: {
        title: "Minimum Window Substring",
        badge: "NeetCode 150 #76",
        prompt: "Find the smallest substring of s that contains every character in t.",
        sampleIo: "Input: s = 'ADOBECODEBANC', t = 'ABC' → Output: 'BANC'",
        starterCodePython: `def minWindow(s, t):
    from collections import Counter
    target = Counter(t)
    window = {}
    have, need = 0, len(target)
    res, res_len = [-1, -1], float('inf')
    l = 0
    for r, c in enumerate(s):
        window[c] = window.get(c, 0) + 1
        if c in target and window[c] == target[c]: have += 1
        while have == need:
            if (r - l + 1) < res_len:
                res, res_len = [l, r], r - l + 1
            window[s[l]] -= 1
            if s[l] in target and window[s[l]] < target[s[l]]: have -= 1
            l += 1
    return s[res[0]:res[1]+1] if res_len != float('inf') else ""`,
        solutionCode: `def minWindow(s, t):
    # Standard sliding window with have/need counter
    ...`,
        complexityNotes: "Time: O(m + n) | Space: O(m + n)",
        hints: ["Track 'have' vs 'need' to avoid comparing full hash maps at each step."],
        testCases: [
          { input: "s = 'ADOBECODEBANC', t = 'ABC'", expected: "'BANC'", desc: "Canonical minimum window" },
          { input: "s = 'a', t = 'a'", expected: "'a'", desc: "Exact single character match" }
        ]
      }
    }
  },
  {
    id: "stack",
    name: "Stack & Monotonic Stack",
    icon: "🥞",
    count: "11 questions",
    badge: "NeetCode Core",
    timeComp: "O(n)",
    spaceComp: "O(n)",
    mentalModel: "LIFO discipline & monotonic ordering for next greater/smaller elements",
    prose: "Stacks enforce Last-In First-Out semantics. Monotonic stacks maintain elements in strictly ascending or descending order, discovering the 'next greater' or 'next smaller' element for all items in a single O(n) pass.",
    analogy: "A spring-loaded plate dispenser: you can only view or remove the plate most recently stacked on top.",
    key_points: {
      pattern: "Bracket matching, expression evaluation, next greater element, histogram areas, and undo history.",
      edgeCases: "Stack underflow (popping empty stack), leftover unclosed opening brackets, empty input.",
      pitfalls: "Forgetting to pop matching opening brackets when closing brackets are encountered.",
      faang: "Design a MinStack supporting push, pop, top, and getMin in O(1) time without extra memory duplication."
    },
    examples: {
      easy: {
        title: "Valid Parentheses",
        badge: "NeetCode 150 #20",
        desc: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        pythonCode: `def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top_elem = stack.pop() if stack else '#'
            if mapping[char] != top_elem: return False
        else:
            stack.append(char)
    return not stack`,
        jsCode: `function isValid(s) {
    const stack = [];
    const map = {')': '(', '}': '{', ']': '['};
    for (const c of s) {
        if (map[c]) {
            if (stack.pop() !== map[c]) return false;
        } else {
            stack.push(c);
        }
    }
    return stack.length === 0;
}`,
        walkthrough: "Opening brackets are pushed onto the stack. Closing brackets pop the top element and verify matching pair types. O(n) time and O(n) space."
      },
      medium: {
        title: "Daily Temperatures",
        badge: "NeetCode 150 #739",
        desc: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.",
        pythonCode: `def dailyTemperatures(temperatures):
    res = [0] * len(temperatures)
    stack = []  # indices of decreasing temperatures
    for i, t in enumerate(temperatures):
        while stack and t > temperatures[stack[-1]]:
            prev_i = stack.pop()
            res[prev_i] = i - prev_i
        stack.append(i)
    return res`,
        jsCode: `function dailyTemperatures(temperatures) {
    const res = new Array(temperatures.length).fill(0);
    const stack = [];
    for (let i = 0; i < temperatures.length; i++) {
        while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
            const prev = stack.pop();
            res[prev] = i - prev;
        }
        stack.push(i);
    }
    return res;
}`,
        walkthrough: "A monotonic decreasing stack stores indices. Each day is pushed and popped at most once, yielding linear O(n) runtime."
      },
      hard: {
        title: "Largest Rectangle in Histogram",
        badge: "NeetCode 150 #84",
        desc: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
        pythonCode: `def largestRectangleArea(heights):
    stack = []  # pair: (index, height)
    max_area = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            max_area = max(max_area, height * (i - idx))
            start = idx
        stack.append((start, h))
    for idx, height in stack:
        max_area = max(max_area, height * (len(heights) - idx))
    return max_area`,
        jsCode: `function largestRectangleArea(heights) {
    const stack = [];
    let maxArea = 0;
    for (let i = 0; i < heights.length; i++) {
        let start = i;
        while (stack.length && stack[stack.length - 1][1] > heights[i]) {
            const [idx, h] = stack.pop();
            maxArea = Math.max(maxArea, h * (i - idx));
            start = idx;
        }
        stack.push([start, heights[i]]);
    }
    for (const [idx, h] of stack) {
        maxArea = Math.max(maxArea, h * (heights.length - idx));
    }
    return maxArea;
}`,
        walkthrough: "Monotonic increasing stack tracks where each height could have started expanding backward. O(n) runtime and O(n) memory."
      }
    },
    practice: {
      easy: {
        title: "Valid Parentheses",
        badge: "NeetCode 150 #20",
        prompt: "Determine if parentheses '()[]{}' in string s are closed in correct nested order.",
        sampleIo: "Input: s = '()[]{}' → Output: true",
        starterCodePython: `def isValid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for c in s:
        if c in pairs:
            if not stack or stack.pop() != pairs[c]: return False
        else:
            stack.append(c)
    return len(stack) == 0`,
        solutionCode: `def isValid(s):
    st = []
    p = {')':'(', '}':'{', ']':'['}
    for c in s:
        if c in p:
            if not st or st.pop() != p[c]: return False
        else: st.append(c)
    return not st`,
        complexityNotes: "Time: O(n) | Space: O(n)",
        hints: ["Push opening brackets; on closing brackets check if top of stack matches."],
        testCases: [
          { input: "s = '()[]{}'", expected: "true", desc: "All standard bracket pairs" },
          { input: "s = '(]'", expected: "false", desc: "Mismatched bracket pair" },
          { input: "s = '([)]'", expected: "false", desc: "Improper interleaving" }
        ]
      },
      medium: {
        title: "Daily Temperatures",
        badge: "NeetCode 150 #739",
        prompt: "Calculate days until next warmer temperature for each day in temperatures.",
        sampleIo: "Input: temperatures = [73,74,75,71,69,72,76,73] → Output: [1,1,4,2,1,1,0,0]",
        starterCodePython: `def dailyTemperatures(temperatures):
    ans = [0] * len(temperatures)
    stack = []  # store indices
    for i, t in enumerate(temperatures):
        while stack and t > temperatures[stack[-1]]:
            prev = stack.pop()
            ans[prev] = i - prev
        stack.append(i)
    return ans`,
        solutionCode: `def dailyTemperatures(temperatures):
    ...`,
        complexityNotes: "Time: O(n) | Space: O(n)",
        hints: ["Use a monotonic decreasing stack to resolve earlier waiting days."],
        testCases: [
          { input: "temperatures = [73,74,75,71,69,72,76,73]", expected: "[1,1,4,2,1,1,0,0]", desc: "Standard forecast" }
        ]
      },
      hard: {
        title: "Largest Rectangle in Histogram",
        badge: "NeetCode 150 #84",
        prompt: "Find the maximum area of a rectangle that can be formed within a histogram.",
        sampleIo: "Input: heights = [2,1,5,6,2,3] → Output: 10 (bars [5,6] with height 5 and width 2)",
        starterCodePython: `def largestRectangleArea(heights):
    stack = []
    max_area = 0
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, height = stack.pop()
            max_area = max(max_area, height * (i - idx))
            start = idx
        stack.append((start, h))
    for idx, h in stack:
        max_area = max(max_area, h * (len(heights) - idx))
    return max_area`,
        solutionCode: `def largestRectangleArea(heights):
    ...`,
        complexityNotes: "Time: O(n) | Space: O(n)",
        hints: ["When a shorter bar arrives, pop taller bars and calculate their bounded rectangles."],
        testCases: [
          { input: "heights = [2,1,5,6,2,3]", expected: "10", desc: "Standard histogram" },
          { input: "heights = [2,4]", expected: "4", desc: "Two increasing bars" }
        ]
      }
    }
  },
  {
    id: "binary_search",
    name: "Binary Search",
    icon: "🔍",
    count: "12 questions",
    badge: "NeetCode Core",
    timeComp: "O(log n)",
    spaceComp: "O(1)",
    mentalModel: "Halve the monotonic candidate space on each comparison",
    prose: "Binary search eliminates half the remaining search space on every iteration by comparing target values with midpoints. Applies to sorted arrays and any monotonic predicate function.",
    analogy: "Opening a dictionary in the middle: if your word starts with 'S' and you landed on 'M', you discard pages 1 through M completely.",
    key_points: {
      pattern: "Sorted array lookups, rotated sorted search, finding inflection peaks, and search on solution space (e.g. Koko Eating Bananas).",
      edgeCases: "Single element array, target out of array bounds, arrays containing duplicates.",
      pitfalls: "Integer overflow bug in `(low + high) // 2`; always use `low + (high - low) // 2`.",
      faang: "Search in Rotated Sorted Array: determine which half is sorted first before checking if target is bounded within it."
    },
    examples: {
      easy: {
        title: "Binary Search",
        badge: "NeetCode 150 #704",
        desc: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index.",
        pythonCode: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1`,
        jsCode: `function search(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`,
        walkthrough: "Logarithmic halving guarantees at most log2(n) steps. O(log n) time and O(1) memory."
      },
      medium: {
        title: "Search in Rotated Sorted Array",
        badge: "NeetCode 150 #33",
        desc: "Given array nums rotated at an unknown pivot, return the index of target if it is in nums, or -1 if it is not.",
        pythonCode: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if target == nums[mid]: return mid
        # Left half is sorted
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]: r = mid - 1
            else: l = mid + 1
        # Right half is sorted
        else:
            if nums[mid] < target <= nums[r]: l = mid + 1
            else: r = mid - 1
    return -1`,
        jsCode: `function search(nums, target) {
    let l = 0, r = nums.length - 1;
    while (l <= r) {
        const mid = Math.floor((l + r) / 2);
        if (nums[mid] === target) return mid;
        if (nums[l] <= nums[mid]) {
            if (nums[l] <= target && target < nums[mid]) r = mid - 1;
            else l = mid + 1;
        } else {
            if (nums[mid] < target && target <= nums[r]) l = mid + 1;
            else r = mid - 1;
        }
    }
    return -1;
}`,
        walkthrough: "At least one half is guaranteed to be monotonically sorted. We check if target sits inside that sorted half; otherwise we pivot to the other half."
      },
      hard: {
        title: "Median of Two Sorted Arrays",
        badge: "NeetCode 150 #4",
        desc: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log(min(m, n))) time.",
        pythonCode: `def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    total = len(nums1) + len(nums2)
    half = total // 2
    if len(B) < len(A): A, B = B, A
    l, r = 0, len(A) - 1
    while True:
        i = (l + r) // 2
        j = half - i - 2
        A_left = A[i] if i >= 0 else float("-inf")
        A_right = A[i + 1] if (i + 1) < len(A) else float("inf")
        B_left = B[j] if j >= 0 else float("-inf")
        B_right = B[j + 1] if (j + 1) < len(B) else float("inf")
        if A_left <= B_right and B_left <= A_right:
            if total % 2: return min(A_right, B_right)
            return (max(A_left, B_left) + min(A_right, B_right)) / 2
        elif A_left > B_right: r = i - 1
        else: l = i + 1`,
        jsCode: `function findMedianSortedArrays(nums1, nums2) {
    let A = nums1, B = nums2;
    if (B.length < A.length) [A, B] = [B, A];
    const total = A.length + B.length;
    const half = Math.floor(total / 2);
    let l = 0, r = A.length - 1;
    while (true) {
        const i = Math.floor((l + r) / 2);
        const j = half - i - 2;
        const Aleft = i >= 0 ? A[i] : -Infinity;
        const Aright = (i + 1) < A.length ? A[i + 1] : Infinity;
        const Bleft = j >= 0 ? B[j] : -Infinity;
        const Bright = (j + 1) < B.length ? B[j + 1] : Infinity;
        if (Aleft <= Bright && Bleft <= Aright) {
            if (total % 2) return Math.min(Aright, Bright);
            return (Math.max(Aleft, Bleft) + Math.min(Aright, Bright)) / 2;
        } else if (Aleft > Bright) r = i - 1;
        else l = i + 1;
    }
}`,
        walkthrough: "Binary search on partitions of the smaller array so that all left elements are <= all right elements. O(log(min(m, n))) runtime."
      }
    },
    practice: {
      easy: {
        title: "Binary Search",
        badge: "NeetCode 150 #704",
        prompt: "Search for target in sorted nums; return index if found or -1.",
        sampleIo: "Input: nums = [-1,0,3,5,9,12], target = 9 → Output: 4",
        starterCodePython: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target: return mid
        elif nums[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1`,
        solutionCode: `def search(nums, target): ...`,
        complexityNotes: "Time: O(log n) | Space: O(1)",
        hints: ["Calculate mid = (l + r) // 2 and narrow the range."],
        testCases: [
          { input: "nums = [-1,0,3,5,9,12], target = 9", expected: "4", desc: "Target in upper half" },
          { input: "nums = [-1,0,3,5,9,12], target = 2", expected: "-1", desc: "Target missing" }
        ]
      },
      medium: {
        title: "Search in Rotated Sorted Array",
        badge: "NeetCode 150 #33",
        prompt: "Search target in rotated sorted array nums in O(log n) time.",
        sampleIo: "Input: nums = [4,5,6,7,0,1,2], target = 0 → Output: 4",
        starterCodePython: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        mid = (l + r) // 2
        if nums[mid] == target: return mid
        if nums[l] <= nums[mid]:
            if nums[l] <= target < nums[mid]: r = mid - 1
            else: l = mid + 1
        else:
            if nums[mid] < target <= nums[r]: l = mid + 1
            else: r = mid - 1
    return -1`,
        solutionCode: `def search(nums, target): ...`,
        complexityNotes: "Time: O(log n) | Space: O(1)",
        hints: ["Identify which half of the array is normally sorted."],
        testCases: [
          { input: "nums = [4,5,6,7,0,1,2], target = 0", expected: "4", desc: "Target after inflection" },
          { input: "nums = [4,5,6,7,0,1,2], target = 3", expected: "-1", desc: "Target not found" }
        ]
      },
      hard: {
        title: "Median of Two Sorted Arrays",
        badge: "NeetCode 150 #4",
        prompt: "Find the median of two sorted arrays in O(log(min(m, n))) time.",
        sampleIo: "Input: nums1 = [1,3], nums2 = [2] → Output: 2.0",
        starterCodePython: `def findMedianSortedArrays(nums1, nums2):
    # Binary search on partitions of the shorter array
    ...`,
        solutionCode: `def findMedianSortedArrays(nums1, nums2): ...`,
        complexityNotes: "Time: O(log(min(m, n))) | Space: O(1)",
        hints: ["Partition both arrays such that left partition has the same count as right partition."],
        testCases: [
          { input: "nums1 = [1,3], nums2 = [2]", expected: "2.0", desc: "Odd total elements" },
          { input: "nums1 = [1,2], nums2 = [3,4]", expected: "2.5", desc: "Even total elements" }
        ]
      }
    }
  },
  {
    id: "linked_lists",
    name: "Linked Lists",
    icon: "🔗",
    count: "14 questions",
    badge: "NeetCode Core",
    timeComp: "O(n) traversal, O(1) head insertion",
    spaceComp: "O(1) in-place rewiring",
    mentalModel: "Pointer rewiring with sentinel dummy nodes",
    prose: "Linked lists consist of nodes containing values and next references. Unlike arrays, nodes are not stored in contiguous memory, allowing O(1) insertions at known nodes but requiring O(n) sequential access.",
    analogy: "A scavenger hunt: each clue card gives you the exact GPS coordinate of the next location.",
    key_points: {
      pattern: "Dummy sentinel head, Floyd's tortoise & hare cycle detection, two pointers moving at offset speeds, in-place list reversal.",
      edgeCases: "Null head, single node list, two-node cycle, deleting head or tail node.",
      pitfalls: "Losing reference to `curr.next` before overwriting it; always cache `nxt = curr.next` first.",
      faang: "Floyd's Cycle Finding: mathematically prove that if a cycle exists, the distance from head to cycle entrance equals distance from meeting point to entrance."
    },
    examples: {
      easy: {
        title: "Reverse Linked List",
        badge: "NeetCode 150 #206",
        desc: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        pythonCode: `def reverseList(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
        jsCode: `function reverseList(head) {
    let prev = null, curr = head;
    while (curr) {
        const nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`,
        walkthrough: "In-place pointer reversal preserves memory. O(n) runtime and O(1) auxiliary space."
      },
      medium: {
        title: "Reorder List",
        badge: "NeetCode 150 #143",
        desc: "Reorder a linked list from L0 -> L1 -> ... -> Ln-1 -> Ln into L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 in-place.",
        pythonCode: `def reorderList(head):
    if not head or not head.next: return
    # 1. Find middle with slow & fast
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    # 2. Reverse second half
    second = slow.next
    prev = slow.next = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    # 3. Interleave two halves
    first, second = head, prev
    while second:
        t1, t2 = first.next, second.next
        first.next = second
        second.next = t1
        first, second = t1, t2`,
        jsCode: `function reorderList(head) {
    if (!head || !head.next) return;
    let slow = head, fast = head.next;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    let second = slow.next;
    let prev = null;
    slow.next = null;
    while (second) {
        const nxt = second.next;
        second.next = prev;
        prev = second;
        second = nxt;
    }
    let first = head;
    second = prev;
    while (second) {
        const t1 = first.next, t2 = second.next;
        first.next = second;
        second.next = t1;
        first = t1;
        second = t2;
    }
}`,
        walkthrough: "Combine three fundamental patterns: slow/fast pointer to find midpoint, in-place reversal, and alternating pointer weaving. O(n) time, O(1) space."
      },
      hard: {
        title: "Merge k Sorted Lists",
        badge: "NeetCode 150 #23",
        desc: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        pythonCode: `import heapq

def mergeKLists(lists):
    dummy = ListNode(0)
    curr = dummy
    heap = []
    for i, node in enumerate(lists):
        if node: heapq.heappush(heap, (node.val, i, node))
    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
        jsCode: `function mergeKLists(lists) {
    if (!lists.length) return null;
    while (lists.length > 1) {
        const merged = [];
        for (let i = 0; i < lists.length; i += 2) {
            const l1 = lists[i];
            const l2 = (i + 1 < lists.length) ? lists[i + 1] : null;
            merged.push(mergeTwoLists(l1, l2));
        }
        lists = merged;
    }
    return lists[0];
}`,
        walkthrough: "Merge lists pairwise using divide-and-conquer (or min-heap of size k) in O(N log k) time."
      }
    },
    practice: {
      easy: {
        title: "Reverse Linked List",
        badge: "NeetCode 150 #206",
        prompt: "Reverse a singly linked list in-place and return the new head.",
        sampleIo: "Input: [1,2,3,4,5] → Output: [5,4,3,2,1]",
        starterCodePython: `def reverseList(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
        solutionCode: `def reverseList(head): ...`,
        complexityNotes: "Time: O(n) | Space: O(1) in-place",
        hints: ["Maintain `prev`, `curr`, and `nxt` pointers to rewire connections backwards."],
        testCases: [
          { input: "head = [1,2,3,4,5]", expected: "[5,4,3,2,1]", desc: "5-node list reversal" },
          { input: "head = [1,2]", expected: "[2,1]", desc: "2-node list" },
          { input: "head = []", expected: "[]", desc: "Empty list" }
        ]
      },
      medium: {
        title: "Linked List Cycle Detection",
        badge: "NeetCode 150 #141",
        prompt: "Detect if a cycle exists in the linked list using O(1) memory.",
        sampleIo: "Input: [3,2,0,-4], pos = 1 → Output: true",
        starterCodePython: `def hasCycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast: return True
    return False`,
        solutionCode: `def hasCycle(head): ...`,
        complexityNotes: "Time: O(n) | Space: O(1) Tortoise & Hare",
        hints: ["Move slow pointer by 1 step and fast pointer by 2 steps."],
        testCases: [
          { input: "head = [3,2,0,-4], pos = 1", expected: "true", desc: "List with cycle" },
          { input: "head = [1], pos = -1", expected: "false", desc: "Single node without cycle" }
        ]
      },
      hard: {
        title: "Merge k Sorted Lists",
        badge: "NeetCode 150 #23",
        prompt: "Merge k sorted linked lists into a single sorted list in O(N log k) time.",
        sampleIo: "Input: [[1,4,5],[1,3,4],[2,6]] → Output: [1,1,2,3,4,4,5,6]",
        starterCodePython: `def mergeKLists(lists):
    # Divide & Conquer or Min-Heap
    ...`,
        solutionCode: `def mergeKLists(lists): ...`,
        complexityNotes: "Time: O(N log k) | Space: O(1) iterative",
        hints: ["Pairwise merge lists in log(k) levels."],
        testCases: [
          { input: "lists = [[1,4,5],[1,3,4],[2,6]]", expected: "[1,1,2,3,4,4,5,6]", desc: "3 sorted lists" }
        ]
      }
    }
  },
  {
    id: "trees",
    name: "Trees & Binary Search Trees",
    icon: "🌳",
    count: "15 questions",
    badge: "NeetCode Core",
    timeComp: "O(n) traversal, O(h) BST operations",
    spaceComp: "O(h) recursion stack",
    mentalModel: "Recursive divide-and-conquer on left and right subtrees",
    prose: "Trees are connected acyclic graphs where every child has exactly one parent. Binary Search Trees (BST) maintain the strict invariant that all nodes in left subtree < node < right subtree.",
    analogy: "An organizational hierarchy: instructions originate from the CEO (root) and flow down through VPs to frontline engineers (leaves).",
    key_points: {
      pattern: "Recursive DFS (pre/in/post-order), queue-based BFS level order traversal, BST search property.",
      edgeCases: "Null root, single node tree, degenerate linked-list tree (skewed height = n).",
      pitfalls: "Validating BST by only comparing node with its immediate children rather than passing global (low, high) bounds.",
      faang: "Lowest Common Ancestor: compare target values against current node in BST vs recursive search in generic binary tree."
    },
    examples: {
      easy: {
        title: "Invert Binary Tree",
        badge: "NeetCode 150 #226",
        desc: "Given the root of a binary tree, invert the tree, and return its root.",
        pythonCode: `def invertTree(root):
    if not root: return None
    root.left, root.right = root.right, root.left
    invertTree(root.left)
    invertTree(root.right)
    return root`,
        jsCode: `function invertTree(root) {
    if (!root) return null;
    [root.left, root.right] = [root.right, root.left];
    invertTree(root.left);
    invertTree(root.right);
    return root;
}`,
        walkthrough: "Swap left and right child pointers at each node, then recursively invert subtrees. O(n) time, O(h) stack space."
      },
      medium: {
        title: "Validate Binary Search Tree",
        badge: "NeetCode 150 #98",
        desc: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
        pythonCode: `def isValidBST(root):
    def valid(node, left, right):
        if not node: return True
        if not (left < node.val < right): return False
        return valid(node.left, left, node.val) and valid(node.right, node.val, right)
    return valid(root, float("-inf"), float("inf"))`,
        jsCode: `function isValidBST(root) {
    function valid(node, left, right) {
        if (!node) return true;
        if (!(left < node.val && node.val < right)) return false;
        return valid(node.left, left, node.val) && valid(node.right, node.val, right);
    }
    return valid(root, -Infinity, Infinity);
}`,
        walkthrough: "Every subtree inherits upper and lower bounds. A node must strictly exceed all its left ancestors and be smaller than all right ancestors."
      },
      hard: {
        title: "Binary Tree Maximum Path Sum",
        badge: "NeetCode 150 #124",
        desc: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge. Return the maximum path sum of any non-empty path.",
        pythonCode: `def maxPathSum(root):
    res = [root.val]
    def dfs(node):
        if not node: return 0
        left_max = max(dfs(node.left), 0)
        right_max = max(dfs(node.right), 0)
        # Compute price with split at current node
        res[0] = max(res[0], node.val + left_max + right_max)
        # Return path without split to parent
        return node.val + max(left_max, right_max)
    dfs(root)
    return res[0]`,
        jsCode: `function maxPathSum(root) {
    let maxVal = root.val;
    function dfs(node) {
        if (!node) return 0;
        const leftMax = Math.max(dfs(node.left), 0);
        const rightMax = Math.max(dfs(node.right), 0);
        maxVal = Math.max(maxVal, node.val + leftMax + rightMax);
        return node.val + Math.max(leftMax, rightMax);
    }
    dfs(root);
    return maxVal;
}`,
        walkthrough: "At each node, we compute the maximum arch sum passing through it, and return the single branch sum upward to the parent. O(n) time."
      }
    },
    practice: {
      easy: {
        title: "Invert Binary Tree",
        badge: "NeetCode 150 #226",
        prompt: "Invert a binary tree by mirroring all left and right child pointers.",
        sampleIo: "Input: root = [4,2,7,1,3,6,9] → Output: [4,7,2,9,6,3,1]",
        starterCodePython: `def invertTree(root):
    if not root: return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root`,
        solutionCode: `def invertTree(root): ...`,
        complexityNotes: "Time: O(n) | Space: O(h)",
        hints: ["Recursively swap left and right subtrees."],
        testCases: [
          { input: "root = [4,2,7,1,3,6,9]", expected: "[4,7,2,9,6,3,1]", desc: "Full 3-level tree" },
          { input: "root = [2,1,3]", expected: "[2,3,1]", desc: "Simple 2-level tree" }
        ]
      },
      medium: {
        title: "Validate BST",
        badge: "NeetCode 150 #98",
        prompt: "Verify if root is a valid Binary Search Tree with strict left < node < right ordering.",
        sampleIo: "Input: root = [2,1,3] → Output: true",
        starterCodePython: `def isValidBST(root):
    def dfs(node, low, high):
        if not node: return True
        if not (low < node.val < high): return False
        return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)
    return dfs(root, float('-inf'), float('inf'))`,
        solutionCode: `def isValidBST(root): ...`,
        complexityNotes: "Time: O(n) | Space: O(h)",
        hints: ["Pass down valid range boundaries (min_val, max_val)."],
        testCases: [
          { input: "root = [2,1,3]", expected: "true", desc: "Valid BST" },
          { input: "root = [5,1,4,null,null,3,6]", expected: "false", desc: "Invalid right child 4 < 5" }
        ]
      },
      hard: {
        title: "Binary Tree Maximum Path Sum",
        badge: "NeetCode 150 #124",
        prompt: "Compute maximum path sum across any sequence of adjacent nodes in the tree.",
        sampleIo: "Input: root = [-10,9,20,null,null,15,7] → Output: 42 (15 + 20 + 7)",
        starterCodePython: `def maxPathSum(root):
    # DFS tracking split path vs single branch
    ...`,
        solutionCode: `def maxPathSum(root): ...`,
        complexityNotes: "Time: O(n) | Space: O(h)",
        hints: ["Ignore negative branches by taking max(0, dfs(child))."],
        testCases: [
          { input: "root = [-10,9,20,null,null,15,7]", expected: "42", desc: "Subtree arch" },
          { input: "root = [1,2,3]", expected: "6", desc: "Simple 3-node sum" }
        ]
      }
    }
  },
  {
    id: "tries",
    name: "Tries (Prefix Trees)",
    icon: "🌲",
    count: "8 questions",
    badge: "NeetCode Core",
    timeComp: "O(L) word length",
    spaceComp: "O(N · L) node graph",
    mentalModel: "Multi-branch prefix tree with end-of-word terminal flags",
    prose: "A Trie (prefix tree) stores string keys by branching across characters. Shared prefixes collapse into identical root paths, enabling lightning fast autocomplete and prefix matching in O(L) time where L is word length.",
    analogy: "A phone keypad or search engine autocomplete: typing 'app' instantly pinpoints both 'apple' and 'application'.",
    key_points: {
      pattern: "Autocomplete, prefix lookups, dictionary spell-checking, and 2D Boggle word search.",
      edgeCases: "Empty string, searching for a prefix that is not marked as end-of-word.",
      pitfalls: "Omitting the boolean `is_end_of_word` flag, mistakenly classifying prefix fragments as valid complete words.",
      faang: "Radix Tree: how to compress single-child linear chains to optimize memory footprint?"
    },
    examples: {
      easy: {
        title: "Prefix Matching",
        badge: "NeetCode Fundamental",
        desc: "Implement character search that verifies if any word in dictionary starts with given prefix.",
        pythonCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word):
        cur = self.root
        for c in word:
            if c not in cur.children: cur.children[c] = TrieNode()
            cur = cur.children[c]
        cur.is_word = True
    def startsWith(self, prefix):
        cur = self.root
        for c in prefix:
            if c not in cur.children: return False
            cur = cur.children[c]
        return True`,
        jsCode: `class Trie {
    constructor() { this.root = {}; }
    insert(word) {
        let node = this.root;
        for (const c of word) {
            if (!node[c]) node[c] = {};
            node = node[c];
        }
        node.isWord = true;
    }
    startsWith(prefix) {
        let node = this.root;
        for (const c of prefix) {
            if (!node[c]) return false;
            node = node[c];
        }
        return true;
    }
}`,
        walkthrough: "Traverse tree following character edges. If all prefix characters match, return true. O(L) time."
      },
      medium: {
        title: "Design Add and Search Words",
        badge: "NeetCode 150 #211",
        desc: "Design a data structure that supports adding new words and searching for existing words with wildcard '.' matching any letter.",
        pythonCode: `class WordDictionary:
    def __init__(self):
        self.root = {}
    def addWord(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node['$'] = True
    def search(self, word):
        def dfs(node, i):
            if i == len(word): return '$' in node
            c = word[i]
            if c == '.':
                for k in node:
                    if k != '$' and dfs(node[k], i + 1): return True
                return False
            if c not in node: return False
            return dfs(node[c], i + 1)
        return dfs(self.root, 0)`,
        jsCode: `class WordDictionary {
    constructor() { this.root = {}; }
    addWord(word) {
        let node = this.root;
        for (const c of word) {
            if (!node[c]) node[c] = {};
            node = node[c];
        }
        node.isEnd = true;
    }
    search(word) {
        const dfs = (node, i) => {
            if (i === word.length) return !!node.isEnd;
            const c = word[i];
            if (c === '.') {
                for (const key of Object.keys(node)) {
                    if (key !== 'isEnd' && dfs(node[key], i + 1)) return true;
                }
                return false;
            }
            if (!node[c]) return false;
            return dfs(node[c], i + 1);
        };
        return dfs(this.root, 0);
    }
}`,
        walkthrough: "Standard Trie lookup augmented with recursive backtracking when wildcard '.' is encountered."
      },
      hard: {
        title: "Word Search II",
        badge: "NeetCode 150 #212",
        desc: "Given an m x n board of characters and a list of strings words, return all words on the board.",
        pythonCode: `def findWords(board, words):
    root = {}
    for w in words:
        node = root
        for c in w: node = node.setdefault(c, {})
        node['#'] = w  # store full word at leaf
    rows, cols = len(board), len(board[0])
    res = []
    def dfs(r, c, parent):
        char = board[r][c]
        curr = parent[char]
        if '#' in curr:
            res.append(curr.pop('#'))  # deduplicate
        board[r][c] = '*'  # mark visited
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in curr:
                dfs(nr, nc, curr)
        board[r][c] = char  # backtrack
        if not curr: parent.pop(char)  # prune leaf
    for r in range(rows):
        for c in range(cols):
            if board[r][c] in root: dfs(r, c, root)
    return res`,
        jsCode: `function findWords(board, words) {
    // Combine Trie with 2D Grid DFS backtracking
    ...
}`,
        walkthrough: "Building a Trie of all target words allows matching prefixes in parallel while walking the board. Pruning dead branches speeds up search by 10x."
      }
    },
    practice: {
      easy: {
        title: "Implement Trie (Prefix Tree)",
        badge: "NeetCode 150 #208",
        prompt: "Implement insert, search, and startsWith methods for a Trie.",
        sampleIo: "insert('apple') -> search('apple') == true; startsWith('app') == true",
        starterCodePython: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word):
        cur = self.root
        for c in word:
            if c not in cur.children: cur.children[c] = TrieNode()
            cur = cur.children[c]
        cur.is_word = True
    def search(self, word):
        cur = self.root
        for c in word:
            if c not in cur.children: return False
            cur = cur.children[c]
        return cur.is_word
    def startsWith(self, prefix):
        cur = self.root
        for c in prefix:
            if c not in cur.children: return False
            cur = cur.children[c]
        return True`,
        solutionCode: `...`,
        complexityNotes: "Time: O(L) | Space: O(N * L)",
        hints: ["Use nested dictionaries with an is_word boolean."],
        testCases: [
          { input: "insert('apple'), search('apple')", expected: "true", desc: "Exact search" },
          { input: "startsWith('app')", expected: "true", desc: "Prefix match" },
          { input: "search('app')", expected: "false", desc: "Prefix not complete word" }
        ]
      },
      medium: {
        title: "Design Add and Search Words",
        badge: "NeetCode 150 #211",
        prompt: "Support adding words and wildcard '.' matching in Trie search.",
        sampleIo: "addWord('bad'); search('.ad') -> true",
        starterCodePython: `class WordDictionary:
    def __init__(self): self.root = {}
    def addWord(self, word):
        node = self.root
        for c in word: node = node.setdefault(c, {})
        node['$'] = True
    def search(self, word): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(M) without dot; O(26^M) worst case with dots",
        hints: ["Recursively explore all child nodes when encountering '.'"],
        testCases: [
          { input: "addWord('bad'), search('.ad')", expected: "true", desc: "Wildcard match" }
        ]
      },
      hard: {
        title: "Word Search II",
        badge: "NeetCode 150 #212",
        prompt: "Search all given words in a 2D Boggle board using Trie and DFS backtracking.",
        sampleIo: "board = [['o','a','b'],['e','t','a']], words = ['eat','oat'] → ['eat','oat']",
        starterCodePython: `def findWords(board, words): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(M * 4^L) | Space: O(N * L)",
        hints: ["Store words in a Trie and prune matched words to avoid duplicate visits."],
        testCases: [
          { input: "words on board", expected: "['eat', 'oat']", desc: "Multi-word board search" }
        ]
      }
    }
  },
  {
    id: "heap_priority_queue",
    name: "Heap / Priority Queue",
    icon: "⛰️",
    count: "10 questions",
    badge: "NeetCode Core",
    timeComp: "O(log n) push/pop, O(1) peek",
    spaceComp: "O(n) or O(k)",
    mentalModel: "Complete binary tree maintaining min/max invariant at the root",
    prose: "Heaps provide logarithmic insertions and deletions while guaranteeing immediate O(1) peek access to the extreme element (minimum or maximum). Essential for streaming medians and top-k rankings.",
    analogy: "An emergency room triage desk: patients are admitted by injury severity rather than chronological arrival time.",
    key_points: {
      pattern: "Top K elements, sliding window median, merging sorted streams, task scheduling.",
      edgeCases: "k exceeding stream length, duplicate priority values, empty heap peek.",
      pitfalls: "Python's `heapq` module is a min-heap by default; invert numeric signs (`-val`) to simulate a max-heap.",
      faang: "Two-heap pattern: maintain a max-heap for lower half and min-heap for upper half to find streaming medians in O(1) time."
    },
    examples: {
      easy: {
        title: "Last Stone Weight",
        badge: "NeetCode 150 #1046",
        desc: "Smash the two heaviest stones until at most one stone remains. Return its weight or 0.",
        pythonCode: `import heapq

def lastStoneWeight(stones):
    h = [-s for s in stones]
    heapq.heapify(h)
    while len(h) > 1:
        s1 = -heapq.heappop(h)
        s2 = -heapq.heappop(h)
        if s1 != s2: heapq.heappush(h, -(s1 - s2))
    return -h[0] if h else 0`,
        jsCode: `function lastStoneWeight(stones) {
    // Max-heap simulation
    while (stones.length > 1) {
        stones.sort((a, b) => b - a);
        const diff = stones[0] - stones[1];
        stones.splice(0, 2);
        if (diff > 0) stones.push(diff);
    }
    return stones.length ? stones[0] : 0;
}`,
        walkthrough: "Inverted values inside Python's min-heap emulate a max-heap. Each smash step takes O(log n). Total time: O(n log n)."
      },
      medium: {
        title: "Kth Largest Element in an Array",
        badge: "NeetCode 150 #215",
        desc: "Given an integer array nums and an integer k, return the kth largest element in the array.",
        pythonCode: `import heapq

def findKthLargest(nums, k):
    # Maintain min-heap of size k
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k: heapq.heappop(heap)
    return heap[0]`,
        jsCode: `function findKthLargest(nums, k) {
    nums.sort((a, b) => b - a);
    return nums[k - 1];
}`,
        walkthrough: "By keeping a min-heap capped at size k, the root always stores the kth largest element. O(n log k) runtime and O(k) memory."
      },
      hard: {
        title: "Find Median from Data Stream",
        badge: "NeetCode 150 #295",
        desc: "Design a data structure that supports adding integers from a stream and computing the running median.",
        pythonCode: `import heapq

class MedianFinder:
    def __init__(self):
        self.small = []  # max-heap (invert signs)
        self.large = []  # min-heap
    def addNum(self, num):
        heapq.heappush(self.small, -num)
        if self.small and self.large and (-self.small[0] > self.large[0]):
            heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.small) > len(self.large) + 1:
            heapq.heappush(self.large, -heapq.heappop(self.small))
        if len(self.large) > len(self.small) + 1:
            heapq.heappush(self.small, -heapq.heappop(self.large))
    def findMedian(self):
        if len(self.small) > len(self.large): return -self.small[0]
        if len(self.large) > len(self.small): return self.large[0]
        return (-self.small[0] + self.large[0]) / 2.0`,
        jsCode: `// Dual heap pattern: maxHeap (small) & minHeap (large)`,
        walkthrough: "Balance two heaps: the lower half in max-heap and upper half in min-heap. Finding median takes O(1) time; insertion takes O(log n)."
      }
    },
    practice: {
      easy: {
        title: "Last Stone Weight",
        badge: "NeetCode 150 #1046",
        prompt: "Continuously smash the two heaviest stones; return remaining weight or 0.",
        sampleIo: "Input: stones = [2,7,4,1,8,1] → Output: 1",
        starterCodePython: `import heapq
def lastStoneWeight(stones):
    h = [-s for s in stones]
    heapq.heapify(h)
    while len(h) > 1:
        s1 = -heapq.heappop(h)
        s2 = -heapq.heappop(h)
        if s1 != s2: heapq.heappush(h, -(s1 - s2))
    return -h[0] if h else 0`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n log n) | Space: O(n)",
        hints: ["Negate numbers to use Python heapq as a max heap."],
        testCases: [
          { input: "stones = [2,7,4,1,8,1]", expected: "1", desc: "Smash down to single stone" },
          { input: "stones = [1]", expected: "1", desc: "Single stone remains" }
        ]
      },
      medium: {
        title: "Kth Largest Element",
        badge: "NeetCode 150 #215",
        prompt: "Find the kth largest element in an unsorted array.",
        sampleIo: "Input: nums = [3,2,1,5,6,4], k = 2 → Output: 5",
        starterCodePython: `import heapq
def findKthLargest(nums, k):
    return heapq.nlargest(k, nums)[-1]`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n log k) | Space: O(k)",
        hints: ["Maintain a min-heap capped at size k."],
        testCases: [
          { input: "nums = [3,2,1,5,6,4], k = 2", expected: "5", desc: "Second largest is 5" },
          { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", expected: "4", desc: "With duplicates" }
        ]
      },
      hard: {
        title: "Find Median from Data Stream",
        badge: "NeetCode 150 #295",
        prompt: "Compute median from continuous streaming numbers in O(1) query time.",
        sampleIo: "add(1), add(2), median() -> 1.5; add(3), median() -> 2.0",
        starterCodePython: `class MedianFinder: ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(log n) add, O(1) query | Space: O(n)",
        hints: ["Balance two halves across a max-heap and min-heap."],
        testCases: [
          { input: "Stream [1, 2, 3]", expected: "2.0", desc: "Odd count median" }
        ]
      }
    }
  },
  {
    id: "backtracking",
    name: "Backtracking",
    icon: "♟️",
    count: "11 questions",
    badge: "NeetCode Core",
    timeComp: "O(2^n) or O(n!)",
    spaceComp: "O(n) call stack",
    mentalModel: "Choose -> Explore -> Unchoose (Undo state mutations)",
    prose: "Backtracking builds candidates incrementally and abandons ('backtracks') branches as soon as it determines they cannot lead to a valid solution. Powers permutations, combinations, and puzzle solvers.",
    analogy: "Exploring a maze: drop breadcrumbs at each intersection; when you hit a dead end, backtrack to the last intersection to try the next path.",
    key_points: {
      pattern: "Subsets, combination sums, permutations, N-Queens, Sudoku solver, word search.",
      edgeCases: "Duplicate numbers in input (sort and skip identical consecutive elements: `if i > start and nums[i] == nums[i-1]: continue`).",
      pitfalls: "Appending the mutable path directly (`res.append(path)`) instead of saving a deep copy (`res.append(path[:])`).",
      faang: "Branch pruning: evaluate bounding constraints before exploring sub-branches to reduce search space by orders of magnitude."
    },
    examples: {
      easy: {
        title: "Subsets",
        badge: "NeetCode 150 #78",
        desc: "Given an integer array nums of unique elements, return all possible subsets (the power set).",
        pythonCode: `def subsets(nums):
    res = []
    subset = []
    def dfs(i):
        if i >= len(nums):
            res.append(subset.copy())
            return
        # Decision 1: include nums[i]
        subset.append(nums[i])
        dfs(i + 1)
        # Decision 2: exclude nums[i]
        subset.pop()
        dfs(i + 1)
    dfs(0)
    return res`,
        jsCode: `function subsets(nums) {
    const res = [];
    const subset = [];
    function dfs(i) {
        if (i >= nums.length) {
            res.push([...subset]);
            return;
        }
        subset.push(nums[i]);
        dfs(i + 1);
        subset.pop();
        dfs(i + 1);
    }
    dfs(0);
    return res;
}`,
        walkthrough: "Binary decision tree: for each element, we either include it or exclude it. 2^n total subsets generated in O(n * 2^n) time."
      },
      medium: {
        title: "Combination Sum",
        badge: "NeetCode 150 #39",
        desc: "Given an array of distinct integers candidates and a target integer target, return all unique combinations where numbers sum to target.",
        pythonCode: `def combinationSum(candidates, target):
    res = []
    def dfs(i, cur, total):
        if total == target:
            res.append(cur.copy())
            return
        if i >= len(candidates) or total > target: return
        # Choose candidate[i] (can reuse)
        cur.append(candidates[i])
        dfs(i, cur, total + candidates[i])
        # Skip candidate[i]
        cur.pop()
        dfs(i + 1, cur, total)
    dfs(0, [], 0)
    return res`,
        jsCode: `function combinationSum(candidates, target) {
    const res = [];
    function dfs(i, cur, total) {
        if (total === target) { res.push([...cur]); return; }
        if (i >= candidates.length || total > target) return;
        cur.push(candidates[i]);
        dfs(i, cur, total + candidates[i]);
        cur.pop();
        dfs(i + 1, cur, total);
    }
    dfs(0, [], 0);
    return res;
}`,
        walkthrough: "Branch into reusing candidates[i] vs skipping to candidates[i+1]. Stops early when total exceeds target."
      },
      hard: {
        title: "N-Queens",
        badge: "NeetCode 150 #51",
        desc: "Place n queens on an n x n chessboard such that no two queens attack each other.",
        pythonCode: `def solveNQueens(n):
    col, pos_diag, neg_diag = set(), set(), set()
    res = []
    board = [["."] * n for _ in range(n)]
    def backtrack(r):
        if r == n:
            res.append(["".join(row) for row in board])
            return
        for c in range(n):
            if c in col or (r + c) in pos_diag or (r - c) in neg_diag:
                continue
            col.add(c)
            pos_diag.add(r + c)
            neg_diag.add(r - c)
            board[r][c] = "Q"
            backtrack(r + 1)
            col.remove(c)
            pos_diag.remove(r + c)
            neg_diag.remove(r - c)
            board[r][c] = "."
    backtrack(0)
    return res`,
        jsCode: `// N-Queens backtracking tracking col, (r+c) and (r-c)`,
        walkthrough: "Track conflicts using column sets and diagonal hash sets: `r + c` for positive diagonals and `r - c` for negative diagonals."
      }
    },
    practice: {
      easy: {
        title: "Subsets",
        badge: "NeetCode 150 #78",
        prompt: "Generate all 2^n subsets (power set) from unique numbers.",
        sampleIo: "Input: nums = [1,2,3] → Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
        starterCodePython: `def subsets(nums):
    res = []
    def dfs(i, path):
        if i == len(nums):
            res.append(path[:])
            return
        dfs(i + 1, path + [nums[i]])
        dfs(i + 1, path)
    dfs(0, [])
    return res`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n * 2^n) | Space: O(n)",
        hints: ["For each element, recurse with it included and with it excluded."],
        testCases: [
          { input: "nums = [1,2,3]", expected: "8 subsets", desc: "3 elements produce 2^3 = 8 subsets" },
          { input: "nums = [0]", expected: "[[],[0]]", desc: "Single element" }
        ]
      },
      medium: {
        title: "Combination Sum",
        badge: "NeetCode 150 #39",
        prompt: "Find all combinations summing to target, allowing elements to be chosen unlimited times.",
        sampleIo: "Input: candidates = [2,3,6,7], target = 7 → Output: [[2,2,3],[7]]",
        starterCodePython: `def combinationSum(candidates, target): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(2^(target/min)) | Space: O(target/min)",
        hints: ["Branch on picking candidates[i] vs moving to candidates[i+1]."],
        testCases: [
          { input: "candidates = [2,3,6,7], target = 7", expected: "[[2,2,3],[7]]", desc: "Target 7" }
        ]
      },
      hard: {
        title: "N-Queens",
        badge: "NeetCode 150 #51",
        prompt: "Place n non-attacking queens on an n x n board.",
        sampleIo: "Input: n = 4 → Output: 2 distinct board solutions",
        starterCodePython: `def solveNQueens(n): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n!) | Space: O(n^2)",
        hints: ["Use sets for cols, diag1 (r + c), and diag2 (r - c)."],
        testCases: [
          { input: "n = 4", expected: "2 solutions", desc: "4x4 board" },
          { input: "n = 1", expected: "[['Q']]", desc: "1x1 board" }
        ]
      }
    }
  },
  {
    id: "graphs",
    name: "Graphs (BFS & DFS)",
    icon: "🕸️",
    count: "14 questions",
    badge: "NeetCode Core",
    timeComp: "O(V + E)",
    spaceComp: "O(V) visited set",
    mentalModel: "Adjacency lists with visited tracking for topological order & connected components",
    prose: "Graphs model arbitrary relationships between vertices connected by edges. Breadth-First Search (BFS) finds shortest paths in unweighted graphs; Depth-First Search (DFS) discovers connected components, cycles, and topological sorting.",
    analogy: "A subway system map: BFS calculates minimum train station transfers; DFS explores an entire subway line all the way to its terminus.",
    key_points: {
      pattern: "Grid flood fill (Number of Islands), cycle detection (directed vs undirected), topological sort (Kahn's or DFS post-order).",
      edgeCases: "Disconnected graphs with multiple isolated components, cyclic loops causing infinite recursion.",
      pitfalls: "Calling recursive DFS on deep graphs without increasing Python's default recursion limit; prefer iterative BFS queue.",
      faang: "Course Schedule: how does topological sorting detect prerequisites circular deadlocks? (Indegree count drops to 0)."
    },
    examples: {
      easy: {
        title: "Flood Fill",
        badge: "NeetCode 150 #733",
        desc: "An image is represented by an m x n integer grid image. Perform a flood fill starting from pixel (sr, sc) with color color.",
        pythonCode: `def floodFill(image, sr, sc, color):
    start = image[sr][sc]
    if start == color: return image
    R, C = len(image), len(image[0])
    def dfs(r, c):
        if 0 <= r < R and 0 <= c < C and image[r][c] == start:
            image[r][c] = color
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)
    dfs(sr, sc)
    return image`,
        jsCode: `function floodFill(image, sr, sc, color) {
    const start = image[sr][sc];
    if (start === color) return image;
    const R = image.length, C = image[0].length;
    function dfs(r, c) {
        if (r >= 0 && r < R && c >= 0 && c < C && image[r][c] === start) {
            image[r][c] = color;
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
        }
    }
    dfs(sr, sc);
    return image;
}`,
        walkthrough: "DFS explores 4-directional neighboring pixels with matching original color, recoloring in O(m * n) time."
      },
      medium: {
        title: "Number of Islands",
        badge: "NeetCode 150 #200",
        desc: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
        pythonCode: `def numIslands(grid):
    if not grid: return 0
    rows, cols = len(grid), len(grid[0])
    islands = 0
    def bfs(r, c):
        q = [(r, c)]
        grid[r][c] = "0"  # mark visited
        while q:
            row, col = q.pop(0)
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = row + dr, col + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == "1":
                    grid[nr][nc] = "0"
                    q.append((nr, nc))
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                bfs(r, c)
                islands += 1
    return islands`,
        jsCode: `function numIslands(grid) {
    let count = 0;
    const R = grid.length, C = grid[0].length;
    function dfs(r, c) {
        if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] === '0') return;
        grid[r][c] = '0';
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
    }
    for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
            if (grid[r][c] === '1') { dfs(r, c); count++; }
        }
    }
    return count;
}`,
        walkthrough: "When unvisited '1' is found, increment counter and sink the entire connected island using BFS/DFS. O(m * n) time."
      },
      hard: {
        title: "Word Ladder",
        badge: "NeetCode 150 #127",
        desc: "Return the number of words in the shortest transformation sequence from beginWord to endWord, mutating 1 letter per step.",
        pythonCode: `from collections import deque, defaultdict

def ladderLength(beginWord, endWord, wordList):
    if endWord not in wordList: return 0
    nei = defaultdict(list)
    wordList.append(beginWord)
    for word in wordList:
        for j in range(len(word)):
            pattern = word[:j] + "*" + word[j+1:]
            nei[pattern].append(word)
    visited = set([beginWord])
    q = deque([beginWord])
    res = 1
    while q:
        for _ in range(len(q)):
            word = q.popleft()
            if word == endWord: return res
            for j in range(len(word)):
                pattern = word[:j] + "*" + word[j+1:]
                for neighbor in nei[pattern]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        q.append(neighbor)
        res += 1
    return 0`,
        jsCode: `// BFS shortest path in unweighted word mutation graph`,
        walkthrough: "BFS guarantees shortest path in unweighted graphs. Group words by wildcard patterns (`c*t` for `cat`, `cot`). O(m^2 * n) time."
      }
    },
    practice: {
      easy: {
        title: "Flood Fill",
        badge: "NeetCode 150 #733",
        prompt: "Recolor connected 4-directional matching pixels starting from (sr, sc).",
        sampleIo: "image = [[1,1,1],[1,1,0],[1,0,1]], sr=1, sc=1, color=2 → [[2,2,2],[2,2,0],[2,0,1]]",
        starterCodePython: `def floodFill(image, sr, sc, color): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(m * n) | Space: O(m * n)",
        hints: ["Check if starting pixel already equals target color first."],
        testCases: [
          { input: "image = [[1,1,1],[1,1,0],[1,0,1]]", expected: "Center cross recolored", desc: "Connected component fill" }
        ]
      },
      medium: {
        title: "Number of Islands",
        badge: "NeetCode 150 #200",
        prompt: "Count the number of 4-directionally connected landmasses ('1's) surrounded by water ('0's).",
        sampleIo: "grid = [['1','1','0'],['1','1','0'],['0','0','1']] → Output: 2",
        starterCodePython: `def numIslands(grid):
    if not grid: return 0
    R, C = len(grid), len(grid[0])
    count = 0
    def sink(r, c):
        if 0 <= r < R and 0 <= c < C and grid[r][c] == '1':
            grid[r][c] = '0'
            sink(r+1, c); sink(r-1, c); sink(r, c+1); sink(r, c-1)
    for r in range(R):
        for c in range(C):
            if grid[r][c] == '1':
                sink(r, c)
                count += 1
    return count`,
        solutionCode: `...`,
        complexityNotes: "Time: O(m * n) | Space: O(m * n)",
        hints: ["Sink visited island squares by mutating '1' to '0'."],
        testCases: [
          { input: "grid with 2 separated islands", expected: "2", desc: "Two distinct islands" }
        ]
      },
      hard: {
        title: "Word Ladder",
        badge: "NeetCode 150 #127",
        prompt: "Find shortest transformation length from beginWord to endWord.",
        sampleIo: "begin = 'hit', end = 'cog', wordList = ['hot','dot','dog','lot','log','cog'] → Output: 5",
        starterCodePython: `def ladderLength(beginWord, endWord, wordList): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(m^2 * n) | Space: O(m^2 * n)",
        hints: ["Use BFS with wildcard pattern map (e.g. 'h*t')."],
        testCases: [
          { input: "hit -> cog", expected: "5", desc: "hit -> hot -> dot -> dog -> cog" }
        ]
      }
    }
  },
  {
    id: "advanced_graphs",
    name: "Advanced Graphs",
    icon: "🛰️",
    count: "8 questions",
    badge: "NeetCode Advanced",
    timeComp: "O(E log V) Dijkstra",
    spaceComp: "O(V + E)",
    mentalModel: "Greedy shortest weighted path & minimum spanning tree",
    prose: "Advanced graphs incorporate weighted edges and directed dependency DAGs. Dijkstra's algorithm solves single-source shortest path with non-negative weights; topological ordering resolves sequence prerequisites.",
    analogy: "Google Maps routing: calculating the fastest path considering live traffic delay tolls and speed limits.",
    key_points: {
      pattern: "Dijkstra (weighted shortest path), Prim/Kruskal (minimum spanning tree), Bellman-Ford (negative weights).",
      edgeCases: "Negative weight cycles, disconnected unreachable destination nodes.",
      pitfalls: "Using standard BFS for weighted graphs; unweighted BFS does not minimize edge cost totals.",
      faang: "Alien Dictionary: build directed graph from lexicographically sorted words and check for topological cycles."
    },
    examples: {
      easy: {
        title: "Direct Flight Reachability",
        badge: "Graph Fundamental",
        desc: "Determine minimum edge transitions to connect flights between airports.",
        pythonCode: `from collections import deque

def canReach(graph, start, dest):
    q = deque([start])
    visited = {start}
    while q:
        node = q.popleft()
        if node == dest: return True
        for nei in graph.get(node, []):
            if nei not in visited:
                visited.add(nei)
                q.append(nei)
    return False`,
        jsCode: `function canReach(graph, start, dest) {
    const q = [start], visited = new Set([start]);
    while (q.length) {
        const u = q.shift();
        if (u === dest) return true;
        for (const v of (graph[u] || [])) {
            if (!visited.has(v)) { visited.add(v); q.push(v); }
        }
    }
    return false;
}`,
        walkthrough: "Standard reachability check using BFS queue in O(V + E)."
      },
      medium: {
        title: "Network Delay Time",
        badge: "NeetCode 150 #743",
        desc: "You are given a network of n nodes, labeled from 1 to n. Return the minimum time it takes for all n nodes to receive a signal sent from node k.",
        pythonCode: `import heapq
from collections import defaultdict

def networkDelayTime(times, n, k):
    edges = defaultdict(list)
    for u, v, w in times: edges[u].append((v, w))
    min_heap = [(0, k)]
    visit = set()
    t = 0
    while min_heap:
        w1, n1 = heapq.heappop(min_heap)
        if n1 in visit: continue
        visit.add(n1)
        t = max(t, w1)
        for n2, w2 in edges[n1]:
            if n2 not in visit:
                heapq.heappush(min_heap, (w1 + w2, n2))
    return t if len(visit) == n else -1`,
        jsCode: `// Dijkstra algorithm with min-heap`,
        walkthrough: "Dijkstra algorithm picks the nearest unvisited node using a min-heap. O(E log V) runtime."
      },
      hard: {
        title: "Alien Dictionary",
        badge: "NeetCode 150 #269",
        desc: "Given a list of words from an alien language sorted lexicographically, derive the order of characters in this alien alphabet.",
        pythonCode: `def alienOrder(words):
    adj = {c: set() for w in words for c in w}
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        min_len = min(len(w1), len(w2))
        if len(w1) > len(w2) and w1[:min_len] == w2[:min_len]: return ""
        for j in range(min_len):
            if w1[j] != w2[j]:
                adj[w1[j]].add(w2[j])
                break
    visited = {}  # False = in path, True = visited
    res = []
    def dfs(c):
        if c in visited: return visited[c]
        visited[c] = False
        for nei in adj[c]:
            if not dfs(nei): return False
        visited[c] = True
        res.append(c)
        return True
    for c in adj:
        if not dfs(c): return ""
    return "".join(res[::-1])`,
        jsCode: `// Topological sort on character difference DAG`,
        walkthrough: "Compare adjacent words to extract character order directed edges, then run topological sort with cycle detection."
      }
    },
    practice: {
      easy: {
        title: "Graph Reachability",
        badge: "Graph Fundamental",
        prompt: "Verify if a destination node can be reached from a source node.",
        sampleIo: "edges = [[0,1],[1,2]], src = 0, dst = 2 → Output: true",
        starterCodePython: `def validPath(n, edges, source, destination): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(V + E) | Space: O(V + E)",
        hints: ["Use BFS or Union-Find to verify connectivity."],
        testCases: [
          { input: "source=0, destination=2", expected: "true", desc: "Linear path" }
        ]
      },
      medium: {
        title: "Network Delay Time",
        badge: "NeetCode 150 #743",
        prompt: "Compute the minimum time for all nodes to receive a broadcast signal using Dijkstra.",
        sampleIo: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2 → Output: 2",
        starterCodePython: `import heapq
def networkDelayTime(times, n, k): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(E log V) | Space: O(V + E)",
        hints: ["Priority queue stores (cumulative_time, node)."],
        testCases: [
          { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", expected: "2", desc: "Broadcasting in 2 units" }
        ]
      },
      hard: {
        title: "Alien Dictionary",
        badge: "NeetCode 150 #269",
        prompt: "Derive alphabet ordering from lexicographically sorted alien words.",
        sampleIo: "words = ['wrt','wrf','er','ett','rftt'] → Output: 'wertf'",
        starterCodePython: `def alienOrder(words): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(C) total characters | Space: O(V + E)",
        hints: ["Extract first mismatching character pair between adjacent words."],
        testCases: [
          { input: "['wrt','wrf','er','ett','rftt']", expected: "'wertf'", desc: "Alien alphabet topological sort" }
        ]
      }
    }
  },
  {
    id: "one_d_dp",
    name: "1-D Dynamic Programming",
    icon: "🧠",
    count: "14 questions",
    badge: "NeetCode Core",
    timeComp: "O(n)",
    spaceComp: "O(1) with rolling variables",
    mentalModel: "Optimal Substructure: dp[i] depends on small constant history",
    prose: "1-D Dynamic Programming breaks problems into overlapping subproblems along a single sequence. By storing results (memoization or tabulation), we reduce exponential recursion trees O(2^n) to linear O(n) passes.",
    analogy: "Climbing a staircase: to know how many ways to reach step 10, just sum the ways to reach step 9 and step 8.",
    key_points: {
      pattern: "Fibonacci variants (Climbing Stairs), decision chains (House Robber), unbounded knapsack (Coin Change), subsequence matching (LIS).",
      edgeCases: "Target value 0, negative values, impossible amounts returning -1.",
      pitfalls: "Top-down recursion without memoization causing Time Limit Exceeded (TLE) crashes.",
      faang: "Space optimization: reduce O(n) DP array down to two scalar variables (e.g. `prev1`, `prev2`) for O(1) memory."
    },
    examples: {
      easy: {
        title: "Climbing Stairs",
        badge: "NeetCode 150 #70",
        desc: "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?",
        pythonCode: `def climbStairs(n):
    if n <= 2: return n
    one, two = 1, 2
    for _ in range(3, n + 1):
        one, two = two, one + two
    return two`,
        jsCode: `function climbStairs(n) {
    if (n <= 2) return n;
    let one = 1, two = 2;
    for (let i = 3; i <= n; i++) {
        const next = one + two;
        one = two;
        two = next;
    }
    return two;
}`,
        walkthrough: "ways(n) = ways(n-1) + ways(n-2). Space optimized to two variables in O(n) time and O(1) space."
      },
      medium: {
        title: "Coin Change",
        badge: "NeetCode 150 #322",
        desc: "Return the fewest number of coins needed to make up an amount, or -1 if impossible.",
        pythonCode: `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if a - c >= 0:
                dp[a] = min(dp[a], 1 + dp[a - c])
    return dp[amount] if dp[amount] != float('inf') else -1`,
        jsCode: `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let a = 1; a <= amount; a++) {
        for (const c of coins) {
            if (a - c >= 0) dp[a] = Math.min(dp[a], 1 + dp[a - c]);
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        walkthrough: "Bottom-up tabulation: for every sub-amount from 1 to target, try every coin. O(amount * len(coins)) runtime."
      },
      hard: {
        title: "Longest Increasing Subsequence",
        badge: "NeetCode 150 #300",
        desc: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        pythonCode: `import bisect

def lengthOfLIS(nums):
    tails = []
    for x in nums:
        idx = bisect.bisect_left(tails, x)
        if idx == len(tails): tails.append(x)
        else: tails[idx] = x
    return len(tails)`,
        jsCode: `function lengthOfLIS(nums) {
    const tails = [];
    for (const x of nums) {
        let l = 0, r = tails.length;
        while (l < r) {
            const m = Math.floor((l + r) / 2);
            if (tails[m] < x) l = m + 1;
            else r = m;
        }
        tails[l] = x;
    }
    return tails.length;
}`,
        walkthrough: "Patience sorting with binary search achieves O(n log n) runtime by maintaining the smallest tail of each subsequence length."
      }
    },
    practice: {
      easy: {
        title: "Climbing Stairs",
        badge: "NeetCode 150 #70",
        prompt: "Calculate distinct ways to climb n stairs taking 1 or 2 steps per jump.",
        sampleIo: "Input: n = 3 → Output: 3 (1+1+1, 1+2, 2+1)",
        starterCodePython: `def climbStairs(n):
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n) | Space: O(1) rolling state",
        hints: ["Notice this matches the Fibonacci sequence."],
        testCases: [
          { input: "n = 2", expected: "2", desc: "Two steps" },
          { input: "n = 3", expected: "3", desc: "Three steps" },
          { input: "n = 5", expected: "8", desc: "Five steps" }
        ]
      },
      medium: {
        title: "Coin Change",
        badge: "NeetCode 150 #322",
        prompt: "Return fewest coins required to make amount, or -1 if impossible.",
        sampleIo: "Input: coins = [1,2,5], amount = 11 → Output: 3 (5 + 5 + 1)",
        starterCodePython: `def coinChange(coins, amount): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(amount * n) | Space: O(amount)",
        hints: ["Initialize dp array of size amount + 1 with infinity."],
        testCases: [
          { input: "coins = [1,2,5], amount = 11", expected: "3", desc: "Standard coins" },
          { input: "coins = [2], amount = 3", expected: "-1", desc: "Impossible amount" }
        ]
      },
      hard: {
        title: "Longest Increasing Subsequence",
        badge: "NeetCode 150 #300",
        prompt: "Compute longest strictly increasing subsequence in O(n log n) time.",
        sampleIo: "Input: nums = [10,9,2,5,3,7,101,18] → Output: 4 ([2,3,7,101])",
        starterCodePython: `def lengthOfLIS(nums): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n log n) | Space: O(n)",
        hints: ["Maintain an array of minimum tails and use binary search."],
        testCases: [
          { input: "nums = [10,9,2,5,3,7,101,18]", expected: "4", desc: "Length 4 sequence" }
        ]
      }
    }
  },
  {
    id: "two_d_dp",
    name: "2-D Dynamic Programming",
    icon: "📐",
    count: "11 questions",
    badge: "NeetCode Advanced",
    timeComp: "O(m · n)",
    spaceComp: "O(n) rolling row",
    mentalModel: "Grid state transitions comparing two strings or 2D matrix paths",
    prose: "2-D Dynamic Programming evaluates states across two orthogonal dimensions, such as grid cell coordinates (row, col) or string indices (i, j).",
    analogy: "A chessboard where the score on any square depends strictly on the best score of the square directly above or directly to the left.",
    key_points: {
      pattern: "Grid paths (Unique Paths), string alignment (Longest Common Subsequence, Edit Distance), 0/1 Knapsack.",
      edgeCases: "Empty strings, 1x1 grids, obstacles blocking entry or exit cells.",
      pitfalls: "Improper base case initialization along row 0 or col 0.",
      faang: "Rolling array: since dp[i][j] only references row i and row i-1, reduce space from O(m * n) to O(n)."
    },
    examples: {
      easy: {
        title: "Unique Paths",
        badge: "NeetCode 150 #62",
        desc: "A robot is located at the top-left corner of an m x n grid. Find the number of unique paths to the bottom-right corner moving only right or down.",
        pythonCode: `def uniquePaths(m, n):
    row = [1] * n
    for _ in range(m - 1):
        new_row = [1] * n
        for j in range(n - 2, -1, -1):
            new_row[j] = new_row[j + 1] + row[j]
        row = new_row
    return row[0]`,
        jsCode: `function uniquePaths(m, n) {
    let row = new Array(n).fill(1);
    for (let i = 0; i < m - 1; i++) {
        const next = new Array(n).fill(1);
        for (let j = n - 2; j >= 0; j--) {
            next[j] = next[j + 1] + row[j];
        }
        row = next;
    }
    return row[0];
}`,
        walkthrough: "dp[r][c] = dp[r+1][c] + dp[r][c+1]. Space optimized to a single row in O(m * n) time and O(n) space."
      },
      medium: {
        title: "Longest Common Subsequence",
        badge: "NeetCode 150 #1143",
        desc: "Given two strings text1 and text2, return the length of their longest common subsequence.",
        pythonCode: `def longestCommonSubsequence(text1, text2):
    dp = [[0] * (len(text2) + 1) for _ in range(len(text1) + 1)]
    for i in range(len(text1) - 1, -1, -1):
        for j in range(len(text2) - 1, -1, -1):
            if text1[i] == text2[j]: dp[i][j] = 1 + dp[i + 1][j + 1]
            else: dp[i][j] = max(dp[i + 1][j], dp[i][j + 1])
    return dp[0][0]`,
        jsCode: `// 2D LCS grid comparison`,
        walkthrough: "If characters match, advance both: `1 + dp[i+1][j+1]`. Otherwise take max of dropping either letter: `max(dp[i+1][j], dp[i][j+1])`."
      },
      hard: {
        title: "Edit Distance",
        badge: "NeetCode 150 #72",
        desc: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2 (insert, delete, replace).",
        pythonCode: `def minDistance(word1, word2):
    dp = [[0] * (len(word2) + 1) for _ in range(len(word1) + 1)]
    for j in range(len(word2) + 1): dp[len(word1)][j] = len(word2) - j
    for i in range(len(word1) + 1): dp[i][len(word2)] = len(word1) - i
    for i in range(len(word1) - 1, -1, -1):
        for j in range(len(word2) - 1, -1, -1):
            if word1[i] == word2[j]: dp[i][j] = dp[i + 1][j + 1]
            else: dp[i][j] = 1 + min(dp[i+1][j], dp[i][j+1], dp[i+1][j+1])
    return dp[0][0]`,
        jsCode: `// Levenshtein distance 2D dynamic programming`,
        walkthrough: "When mismatch: try insert (dp[i][j+1]), delete (dp[i+1][j]), or replace (dp[i+1][j+1]) and take minimum + 1."
      }
    },
    practice: {
      easy: {
        title: "Unique Paths",
        badge: "NeetCode 150 #62",
        prompt: "Calculate unique paths from top-left to bottom-right in m x n grid.",
        sampleIo: "Input: m = 3, n = 7 → Output: 28",
        starterCodePython: `def uniquePaths(m, n):
    dp = [1] * n
    for _ in range(m - 1):
        for j in range(1, n): dp[j] += dp[j - 1]
    return dp[-1]`,
        solutionCode: `...`,
        complexityNotes: "Time: O(m * n) | Space: O(n)",
        hints: ["Each square can only be reached from above or from the left."],
        testCases: [
          { input: "m = 3, n = 7", expected: "28", desc: "3x7 grid" },
          { input: "m = 3, n = 2", expected: "3", desc: "3x2 grid" }
        ]
      },
      medium: {
        title: "Longest Common Subsequence",
        badge: "NeetCode 150 #1143",
        prompt: "Return the length of the longest common subsequence between text1 and text2.",
        sampleIo: "Input: text1 = 'abcde', text2 = 'ace' → Output: 3 ('ace')",
        starterCodePython: `def longestCommonSubsequence(text1, text2): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(m * n) | Space: O(m * n)",
        hints: ["Match diagonal + 1; mismatch max of left and top."],
        testCases: [
          { input: "text1 = 'abcde', text2 = 'ace'", expected: "3", desc: "Common 'ace'" }
        ]
      },
      hard: {
        title: "Edit Distance",
        badge: "NeetCode 150 #72",
        prompt: "Find minimum edits (insert, delete, replace) to transform word1 into word2.",
        sampleIo: "Input: word1 = 'horse', word2 = 'ros' → Output: 3",
        starterCodePython: `def minDistance(word1, word2): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(m * n) | Space: O(m * n)",
        hints: ["3 operations: insert -> j+1, delete -> i+1, replace -> i+1, j+1."],
        testCases: [
          { input: "word1 = 'horse', word2 = 'ros'", expected: "3", desc: "3 operations" }
        ]
      }
    }
  },
  {
    id: "greedy",
    name: "Greedy Algorithms",
    icon: "💰",
    count: "9 questions",
    badge: "NeetCode Core",
    timeComp: "O(n) or O(n log n)",
    spaceComp: "O(1)",
    mentalModel: "Locally optimal choice yields global optimum without backtracking",
    prose: "Greedy algorithms make the immediate, locally best choice at each step without backtracking. They work when problems exhibit both optimal substructure and the greedy-choice property.",
    analogy: "Cash dispensing from an ATM: always hand out the largest possible bill denomination first to minimize total notes.",
    key_points: {
      pattern: "Kadane's max subarray, Jump Game, Gas Station, task scheduling, partition labels.",
      edgeCases: "Negative numbers, zero step jumps, circular routes.",
      pitfalls: "Assuming a problem is greedy when overlapping subproblems actually require dynamic programming.",
      faang: "Gas Station: prove why starting at `i + 1` is optimal when running gas drops below 0 at index `i`."
    },
    examples: {
      easy: {
        title: "Maximum Subarray (Kadane)",
        badge: "NeetCode 150 #53",
        desc: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        pythonCode: `def maxSubArray(nums):
    max_sum = nums[0]
    cur_sum = 0
    for n in nums:
        cur_sum = max(n, cur_sum + n)
        max_sum = max(max_sum, cur_sum)
    return max_sum`,
        jsCode: `function maxSubArray(nums) {
    let maxSum = nums[0], curSum = 0;
    for (const n of nums) {
        curSum = Math.max(n, curSum + n);
        maxSum = Math.max(maxSum, curSum);
    }
    return maxSum;
}`,
        walkthrough: "Kadane's algorithm resets the running sum if it drops below the current number. O(n) runtime and O(1) space."
      },
      medium: {
        title: "Jump Game",
        badge: "NeetCode 150 #55",
        desc: "You are given an integer array nums. You are initially positioned at the first index. Return true if you can reach the last index.",
        pythonCode: `def canJump(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:
            goal = i
    return goal == 0`,
        jsCode: `function canJump(nums) {
    let goal = nums.length - 1;
    for (let i = nums.length - 2; i >= 0; i--) {
        if (i + nums[i] >= goal) goal = i;
    }
    return goal === 0;
}`,
        walkthrough: "Walk backward from the end goal: if the current index can reach the goal, move the goalpost left. O(n) runtime."
      },
      hard: {
        title: "Gas Station",
        badge: "NeetCode 150 #134",
        desc: "Return the starting gas station's index if you can travel around the circuit once, otherwise return -1.",
        pythonCode: `def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost): return -1
    total, res = 0, 0
    for i in range(len(gas)):
        total += (gas[i] - cost[i])
        if total < 0:
            total = 0
            res = i + 1
    return res`,
        jsCode: `// Single pass greedy starting index search`,
        walkthrough: "If total gas >= total cost, a solution is mathematically guaranteed. Reset start to `i + 1` whenever tank dips below 0. O(n) time."
      }
    },
    practice: {
      easy: {
        title: "Maximum Subarray",
        badge: "NeetCode 150 #53",
        prompt: "Find the maximum subarray sum in O(n) time via Kadane's algorithm.",
        sampleIo: "Input: nums = [-2,1,-3,4,-1,2,1,-5,4] → Output: 6 ([4,-1,2,1])",
        starterCodePython: `def maxSubArray(nums):
    max_sum, cur = nums[0], 0
    for n in nums:
        cur = max(n, cur + n)
        max_sum = max(max_sum, cur)
    return max_sum`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n) | Space: O(1)",
        hints: ["Discard running sum if it drops below current number."],
        testCases: [
          { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", expected: "6", desc: "Standard subarray" },
          { input: "nums = [1]", expected: "1", desc: "Single positive" }
        ]
      },
      medium: {
        title: "Jump Game",
        badge: "NeetCode 150 #55",
        prompt: "Determine if you can jump to the last index.",
        sampleIo: "Input: nums = [2,3,1,1,4] → Output: true",
        starterCodePython: `def canJump(nums): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n) | Space: O(1)",
        hints: ["Shift goalpost backward from end to start."],
        testCases: [
          { input: "nums = [2,3,1,1,4]", expected: "true", desc: "Reachable" },
          { input: "nums = [3,2,1,0,4]", expected: "false", desc: "Trapped at 0" }
        ]
      },
      hard: {
        title: "Gas Station",
        badge: "NeetCode 150 #134",
        prompt: "Find unique circular starting index that completes the full circuit.",
        sampleIo: "gas = [1,2,3,4,5], cost = [3,4,5,1,2] → Output: 3",
        starterCodePython: `def canCompleteCircuit(gas, cost): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n) | Space: O(1)",
        hints: ["If sum(gas) < sum(cost), impossible; else advance start whenever total < 0."],
        testCases: [
          { input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", expected: "3", desc: "Station index 3" }
        ]
      }
    }
  },
  {
    id: "intervals",
    name: "Intervals",
    icon: "⏱️",
    count: "8 questions",
    badge: "NeetCode Core",
    timeComp: "O(n log n) sorting",
    spaceComp: "O(n)",
    mentalModel: "Sort intervals by start time and merge overlaps",
    prose: "Interval problems involve continuous ranges [start, end]. Sorting by start time simplifies conflict detection, insertion, and merging into linear sweeps.",
    analogy: "Booking conference rooms: sorting calendar reservations by start time to immediately spot overlapping meetings.",
    key_points: {
      pattern: "Sort by start time, merge overlapping intervals, insert new intervals, detect room conflicts.",
      edgeCases: "Single interval, non-overlapping adjacent intervals that touch `[1, 4]` and `[4, 5]`, nested intervals `[1, 10]` and `[2, 3]`.",
      pitfalls: "Forgetting to sort intervals before checking overlaps.",
      faang: "Meeting Rooms II: finding minimum conference rooms using min-heap vs two-pointer sweep-line."
    },
    examples: {
      easy: {
        title: "Meeting Rooms",
        badge: "NeetCode 150 #252",
        desc: "Given an array of meeting time intervals where intervals[i] = [start_i, end_i], determine if a person could attend all meetings.",
        pythonCode: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda x: x[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]: return False
    return True`,
        jsCode: `function canAttendMeetings(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] < intervals[i - 1][1]) return false;
    }
    return true;
}`,
        walkthrough: "Sort by start time. If any meeting starts before the previous meeting concludes, return false. O(n log n) time."
      },
      medium: {
        title: "Merge Intervals",
        badge: "NeetCode 150 #56",
        desc: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.",
        pythonCode: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        last_end = merged[-1][1]
        if start <= last_end:
            merged[-1][1] = max(last_end, end)
        else:
            merged.append([start, end])
    return merged`,
        jsCode: `function merge(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const [start, end] = intervals[i];
        if (start <= merged[merged.length - 1][1]) {
            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
        } else {
            merged.push([start, end]);
        }
    }
    return merged;
}`,
        walkthrough: "Sort by start time. If current start <= previous end, expand previous end = max(previous end, current end). O(n log n)."
      },
      hard: {
        title: "Minimum Interval to Include Each Query",
        badge: "NeetCode 150 #1851",
        desc: "Given intervals and queries, return the smallest interval size that contains each query.",
        pythonCode: `import heapq

def minInterval(intervals, queries):
    intervals.sort()
    min_heap = []
    res = {}
    i = 0
    for q in sorted(queries):
        while i < len(intervals) and intervals[i][0] <= q:
            l, r = intervals[i]
            heapq.heappush(min_heap, (r - l + 1, r))
            i += 1
        while min_heap and min_heap[0][1] < q:
            heapq.heappop(min_heap)
        res[q] = min_heap[0][0] if min_heap else -1
    return [res[q] for q in queries]`,
        jsCode: `// Min-heap tracking interval sizes with sweep-line query processing`,
        walkthrough: "Sort intervals and queries. Push valid candidate intervals into min-heap sorted by size. Discard expired intervals in O((n + q) log n)."
      }
    },
    practice: {
      easy: {
        title: "Meeting Rooms",
        badge: "NeetCode 150 #252",
        prompt: "Check if a person can attend all meetings without schedule conflicts.",
        sampleIo: "Input: intervals = [[0,30],[5,10],[15,20]] → Output: false",
        starterCodePython: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda x: x[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i-1][1]: return False
    return True`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n log n) | Space: O(1)",
        hints: ["Sort meetings by start time and check if adjacent meetings overlap."],
        testCases: [
          { input: "intervals = [[0,30],[5,10],[15,20]]", expected: "false", desc: "Overlapping meetings" },
          { input: "intervals = [[7,10],[2,4]]", expected: "true", desc: "No conflicts" }
        ]
      },
      medium: {
        title: "Merge Intervals",
        badge: "NeetCode 150 #56",
        prompt: "Merge all overlapping intervals into non-overlapping ranges.",
        sampleIo: "Input: intervals = [[1,3],[2,6],[8,10],[15,18]] → Output: [[1,6],[8,10],[15,18]]",
        starterCodePython: `def merge(intervals): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n log n) | Space: O(n)",
        hints: ["Sort by start time; expand `merged[-1][1]` if current start overlaps."],
        testCases: [
          { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]", desc: "Standard merge" }
        ]
      },
      hard: {
        title: "Minimum Interval Query",
        badge: "NeetCode 150 #1851",
        prompt: "Find the smallest interval size containing each query value.",
        sampleIo: "intervals = [[1,4],[2,4],[3,6]], queries = [2,3,4,5] → Output: [3,3,3,4]",
        starterCodePython: `def minInterval(intervals, queries): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n log n + q log q) | Space: O(n)",
        hints: ["Sort queries and maintain candidate intervals in a min-heap."],
        testCases: [
          { input: "queries = [2,3,4,5]", expected: "[3,3,3,4]", desc: "Smallest containing intervals" }
        ]
      }
    }
  },
  {
    id: "math_geometry",
    name: "Math & Geometry",
    icon: "🧮",
    count: "8 questions",
    badge: "NeetCode Core",
    timeComp: "O(1) or O(log n)",
    spaceComp: "O(1)",
    mentalModel: "Number theory, matrix rotation symmetries, and cycle detection",
    prose: "Math and geometry algorithms exploit arithmetic properties, modular arithmetic, coordinate geometry, and matrix reflections.",
    analogy: "Rotating a Rubik's cube face: transpose rows and columns, then reverse each row to achieve a clockwise 90-degree turn.",
    key_points: {
      pattern: "Matrix rotation (transpose then reverse), Happy Number (cycle detection via Floyd or set), Pow(x, n) binary exponentiation.",
      edgeCases: "Negative integers in modulo arithmetic, 32-bit signed integer limits.",
      pitfalls: "Allocating a brand new matrix when an in-place O(1) space rotation was required.",
      faang: "Multiply Strings: manual column-by-column multiplication without using built-in big integer parsing."
    },
    examples: {
      easy: {
        title: "Happy Number",
        badge: "NeetCode 150 #202",
        desc: "Starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat until the number equals 1 or loops endlessly.",
        pythonCode: `def isHappy(n):
    def sum_squares(num):
        res = 0
        while num:
            res += (num % 10) ** 2
            num //= 10
        return res
    slow, fast = n, sum_squares(n)
    while fast != 1 and slow != fast:
        slow = sum_squares(slow)
        fast = sum_squares(sum_squares(fast))
    return fast == 1`,
        jsCode: `function isHappy(n) {
    const sumSq = num => {
        let res = 0;
        while (num) { res += (num % 10) ** 2; num = Math.floor(num / 10); }
        return res;
    };
    let slow = n, fast = sumSq(n);
    while (fast !== 1 && slow !== fast) {
        slow = sumSq(slow);
        fast = sumSq(sumSq(fast));
    }
    return fast === 1;
}`,
        walkthrough: "Detect digit square sum cycle using Floyd's Tortoise and Hare algorithm in O(log n) time and O(1) space."
      },
      medium: {
        title: "Rotate Image",
        badge: "NeetCode 150 #48",
        desc: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise) in-place.",
        pythonCode: `def rotate(matrix):
    n = len(matrix)
    # 1. Transpose matrix
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # 2. Reverse each row
    for i in range(n):
        matrix[i].reverse()`,
        jsCode: `function rotate(matrix) {
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    for (let i = 0; i < n; i++) matrix[i].reverse();
}`,
        walkthrough: "A 90-degree clockwise rotation equals transposing across the main diagonal followed by reversing each row horizontally. O(n^2) time, O(1) space."
      },
      hard: {
        title: "Detect Squares",
        badge: "NeetCode 150 #2013",
        desc: "Add data stream points and count ways to choose three points such that the four points form an axis-aligned square.",
        pythonCode: `from collections import defaultdict

class DetectSquares:
    def __init__(self):
        self.points = defaultdict(int)
        self.pts_list = []
    def add(self, point):
        self.points[tuple(point)] += 1
        self.pts_list.append(point)
    def count(self, point):
        res = 0
        px, py = point
        for x, y in self.pts_list:
            if abs(px - x) != abs(py - y) or px == x or py == y: continue
            res += self.points[(px, y)] * self.points[(x, py)]
        return res`,
        jsCode: `// Diagonal matching for axis-aligned square detection`,
        walkthrough: "Find diagonal opposite corners where |px - x| == |py - y| > 0, then check for remaining two corners in O(N)."
      }
    },
    practice: {
      easy: {
        title: "Happy Number",
        badge: "NeetCode 150 #202",
        prompt: "Determine if n reaches 1 via sum of digit squares without cycle.",
        sampleIo: "Input: n = 19 → Output: true",
        starterCodePython: `def isHappy(n): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(log n) | Space: O(1) Floyd",
        hints: ["Use fast & slow pointers to detect digit square cycles."],
        testCases: [
          { input: "n = 19", expected: "true", desc: "Happy sequence to 1" },
          { input: "n = 2", expected: "false", desc: "Endless cycle" }
        ]
      },
      medium: {
        title: "Rotate Image",
        badge: "NeetCode 150 #48",
        prompt: "Rotate n x n matrix 90 degrees clockwise in-place.",
        sampleIo: "Input: [[1,2],[3,4]] → Output: [[3,1],[4,2]]",
        starterCodePython: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i, n): matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix: row.reverse()`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n^2) | Space: O(1) in-place",
        hints: ["Transpose matrix then reverse each row."],
        testCases: [
          { input: "[[1,2],[3,4]]", expected: "[[3,1],[4,2]]", desc: "2x2 rotation" }
        ]
      },
      hard: {
        title: "Detect Squares",
        badge: "NeetCode 150 #2013",
        prompt: "Count axis-aligned squares formed by point query and stored points.",
        sampleIo: "add([3,10]), add([11,2]), add([3,2]); count([11,10]) → Output: 1",
        starterCodePython: `class DetectSquares: ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n) count, O(1) add | Space: O(n)",
        hints: ["Iterate over diagonal corners and multiply frequencies of adjacent corners."],
        testCases: [
          { input: "Square query", expected: "1", desc: "Single square found" }
        ]
      }
    }
  },
  {
    id: "bit_manipulation",
    name: "Bit Manipulation",
    icon: "⚙️",
    count: "9 questions",
    badge: "NeetCode Core",
    timeComp: "O(1) / O(32)",
    spaceComp: "O(1)",
    mentalModel: "Bitwise XOR, AND, OR, and Bit Masks",
    prose: "Bit manipulation executes direct arithmetic operations at the machine binary word level. XOR eliminates identical duplicates; AND masks check flag status; bit shifts multiply or divide by powers of two in single clock cycles.",
    analogy: "A control panel of 32 physical light switches: toggling individual circuits with zero memory overhead.",
    key_points: {
      pattern: "Single Number via XOR (`x ^ x = 0`, `x ^ 0 = x`), Kernighan's bit count (`n & (n - 1)` clears lowest set bit), powers of two check (`(n & (n - 1)) == 0`).",
      edgeCases: "Signed 32-bit limits, negative numbers represented in two's complement.",
      pitfalls: "Operator precedence: in Python, `&` and `|` have LOWER precedence than `==`! Always wrap comparisons in parentheses: `(n & 1) == 1`.",
      faang: "Sum of Two Integers without `+` or `-`: use XOR for partial addition and `(a & b) << 1` for carry propagation."
    },
    examples: {
      easy: {
        title: "Single Number",
        badge: "NeetCode 150 #136",
        desc: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one in O(n) time and O(1) space.",
        pythonCode: `def singleNumber(nums):
    res = 0
    for n in nums:
        res ^= n
    return res`,
        jsCode: `function singleNumber(nums) {
    let res = 0;
    for (const n of nums) res ^= n;
    return res;
}`,
        walkthrough: "Since n ^ n = 0 and n ^ 0 = n, XORing all array elements cancels all duplicates, leaving only the unique number. O(n) time and O(1) memory."
      },
      medium: {
        title: "Number of 1 Bits",
        badge: "NeetCode 150 #191",
        desc: "Given a positive integer n, write a function that returns the number of set bits it has (also known as the Hamming weight).",
        pythonCode: `def hammingWeight(n):
    res = 0
    while n:
        n &= (n - 1)  # drops lowest set bit
        res += 1
    return res`,
        jsCode: `function hammingWeight(n) {
    let res = 0;
    while (n !== 0) {
        n &= (n - 1);
        res++;
    }
    return res;
}`,
        walkthrough: "Brian Kernighan's algorithm clears the lowest set bit on each iteration. Runs in O(k) time where k is the number of 1-bits."
      },
      hard: {
        title: "Sum of Two Integers",
        badge: "NeetCode 150 #371",
        desc: "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
        pythonCode: `def getSum(a, b):
    mask = 0xFFFFFFFF
    while (b & mask) > 0:
        carry = (a & b) << 1
        a = (a ^ b)
        b = carry
    return (a & mask) if b > 0 else a`,
        jsCode: `function getSum(a, b) {
    while (b !== 0) {
        const carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}`,
        walkthrough: "Half-adder logic: XOR computes sum without carry; AND shifted left by 1 computes carry bits. Repeat until carry is zero."
      }
    },
    practice: {
      easy: {
        title: "Single Number",
        badge: "NeetCode 150 #136",
        prompt: "Find the single unique number in an array where every other number appears twice.",
        sampleIo: "Input: nums = [4,1,2,1,2] → Output: 4",
        starterCodePython: `def singleNumber(nums):
    res = 0
    for n in nums: res ^= n
    return res`,
        solutionCode: `...`,
        complexityNotes: "Time: O(n) | Space: O(1)",
        hints: ["XORing any number with itself cancels to 0."],
        testCases: [
          { input: "nums = [4,1,2,1,2]", expected: "4", desc: "Unique 4" },
          { input: "nums = [2,2,1]", expected: "1", desc: "Unique 1" }
        ]
      },
      medium: {
        title: "Number of 1 Bits",
        badge: "NeetCode 150 #191",
        prompt: "Calculate Hamming weight (count of 1s in binary representation).",
        sampleIo: "Input: n = 11 (binary: 00001011) → Output: 3",
        starterCodePython: `def hammingWeight(n):
    c = 0
    while n:
        n &= (n - 1)
        c += 1
    return c`,
        solutionCode: `...`,
        complexityNotes: "Time: O(k) set bits | Space: O(1)",
        hints: ["`n & (n - 1)` clears the lowest set bit in one instruction."],
        testCases: [
          { input: "n = 11", expected: "3", desc: "Three 1-bits" },
          { input: "n = 128", expected: "1", desc: "Power of 2 single bit" }
        ]
      },
      hard: {
        title: "Sum of Two Integers",
        badge: "NeetCode 150 #371",
        prompt: "Add two integers without using '+' or '-' operators.",
        sampleIo: "Input: a = 2, b = 3 → Output: 5",
        starterCodePython: `def getSum(a, b): ...`,
        solutionCode: `...`,
        complexityNotes: "Time: O(1) / O(32) | Space: O(1)",
        hints: ["XOR gives sum without carry; AND shifted left gives carry."],
        testCases: [
          { input: "a = 2, b = 3", expected: "5", desc: "Positive addition" }
        ]
      }
    }
  }
];
