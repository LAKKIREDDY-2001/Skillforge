"""Pre-built DSA question library — 10 topics × 3 difficulties with voice-optimized metadata."""

TOPICS = [
    "arrays",
    "linked_lists",
    "trees",
    "graphs",
    "dynamic_programming",
    "sorting",
    "searching",
    "stacks_queues",
    "hash_tables",
    "strings",
]

TOPIC_METADATA = {
    "arrays": {"title": "Arrays & Two Pointers", "icon": "📊", "description": "Contiguous memory, two pointers, sliding window, and Kadane's algorithm."},
    "linked_lists": {"title": "Linked Lists", "icon": "🔗", "description": "Pointer manipulation, Floyd's cycle detection, and list reversal."},
    "trees": {"title": "Trees & Binary Search Trees", "icon": "🌳", "description": "Hierarchical structures, tree traversals, and BST validation."},
    "graphs": {"title": "Graphs & Pathfinding", "icon": "🕸️", "description": "BFS, DFS, Dijkstra, topological sort, and cycle detection."},
    "dynamic_programming": {"title": "Dynamic Programming", "icon": "⚡", "description": "Memoization, tabulation, optimal substructure, and state transitions."},
    "sorting": {"title": "Sorting Algorithms", "icon": "🔢", "description": "Quicksort, merge sort, stability, and non-comparison sorting."},
    "searching": {"title": "Searching & Binary Search", "icon": "🔍", "description": "Binary search variations, rotated arrays, and search space reduction."},
    "stacks_queues": {"title": "Stacks & Queues", "icon": "🥞", "description": "LIFO/FIFO patterns, monotonic stacks, and priority queues."},
    "hash_tables": {"title": "Hash Tables & Sets", "icon": "🗝️", "description": "O(1) lookups, collision resolution, and load factor mechanics."},
    "strings": {"title": "Strings & Pattern Matching", "icon": "🔤", "description": "Two pointers, palindromes, sliding window, and KMP algorithm."},
}

QUESTION_BANK: dict[str, dict[str, list[dict]]] = {
    "arrays": {
        "easy": [
            {
                "id": "arrays_easy_1",
                "question": "What is the time complexity of accessing an element by index in a contiguous array, and why?",
                "answer": "O(1) constant time, because arrays use direct memory address calculation (base address + index * element size).",
                "hint": "Think about arithmetic: base memory address plus index times element byte size.",
                "key_points": ["O(1)", "constant time", "direct address", "pointer arithmetic", "index"],
                "voice_tip": "Mention big-O of 1 and direct pointer arithmetic.",
            },
            {
                "id": "arrays_easy_2",
                "question": "What is the time complexity of inserting an element at the beginning of a dynamic array of size n?",
                "answer": "O(n) in the worst case, because all existing n elements must be shifted one position to the right.",
                "hint": "Think about what must happen to the elements currently sitting in index zero through n minus one.",
                "key_points": ["O(n)", "linear time", "shifting", "right shift", "worst case"],
                "voice_tip": "Explain that every element has to shift to make room.",
            },
        ],
        "medium": [
            {
                "id": "arrays_med_1",
                "question": "Describe the two-pointer technique for finding a pair of numbers that sum to a target in a sorted array.",
                "answer": "Initialize left pointer at 0 and right pointer at n-1. While left < right, calculate sum. If sum equals target, return indices. If sum < target, increment left. If sum > target, decrement right. Runs in O(n) time and O(1) space.",
                "hint": "Start one pointer at each end. If the sum is too small, how do you increase it? If too large, how do you decrease it?",
                "key_points": ["left and right pointers", "sorted", "increment left if sum is small", "decrement right if sum is large", "O(n) time", "O(1) space"],
                "voice_tip": "Emphasize moving inward based on comparison with target.",
            },
            {
                "id": "arrays_med_2",
                "question": "How does Kadane's algorithm find the maximum subarray sum in O(n) time?",
                "answer": "Maintain current_sum and max_sum. For each element, decide whether to add it to current_sum or start a fresh subarray at that element (current_sum = max(num, current_sum + num)). Update max_sum at each step.",
                "hint": "At each number, decide: is it better to extend the existing running sum, or start fresh from the current number?",
                "key_points": ["Kadane's algorithm", "current_sum", "max_sum", "reset or extend", "O(n) linear time"],
                "voice_tip": "Highlight the choice between extending the running sum or resetting.",
            },
        ],
        "hard": [
            {
                "id": "arrays_hard_1",
                "question": "Explain how to find the length of the longest consecutive elements sequence in an unsorted array in O(n) time.",
                "answer": "Insert all numbers into a hash set. Iterate through the set, but only start counting a streak if (num - 1) is NOT in the set (identifying the beginning of a sequence). Then count upward (num + 1, num + 2) while elements exist in the set. Each element is visited at most twice, achieving O(n) total time.",
                "hint": "Use a hash set. How can you ensure you only expand sequences starting from their true minimum element?",
                "key_points": ["hash set", "O(n) time", "check num minus 1", "streak start", "amortized linear"],
                "voice_tip": "Focus on checking if num minus 1 exists to identify the streak root.",
            },
            {
                "id": "arrays_hard_2",
                "question": "How can the Trapping Rain Water problem be solved in O(n) time and O(1) extra space?",
                "answer": "Use two pointers, left at 0 and right at n-1, tracking left_max and right_max. Move whichever pointer has the smaller maximum inward, adding water equal to (current_max - current_height) since the opposite side is guaranteed to be equal or taller.",
                "hint": "Two pointers from the outside in. The trapped water over any bar is bounded by the shorter of the two surrounding peak boundaries.",
                "key_points": ["two pointers", "left_max and right_max", "move smaller boundary", "O(n) time", "O(1) space"],
                "voice_tip": "State that the shorter wall determines water height.",
            },
        ],
    },
    "linked_lists": {
        "easy": [
            {
                "id": "ll_easy_1",
                "question": "What is the time complexity of prepending a node to the head of a singly linked list?",
                "answer": "O(1) constant time, because you only instantiate the new node, point its next to the current head, and update the head pointer.",
                "hint": "No elements need to be shifted in memory. Only one or two pointer reassignments occur.",
                "key_points": ["O(1)", "constant time", "head pointer", "update next pointer"],
                "voice_tip": "Emphasize constant time pointer reassignment.",
            },
        ],
        "medium": [
            {
                "id": "ll_med_1",
                "question": "How does Floyd's Cycle-Finding Algorithm (Tortoise and Hare) detect a cycle in a linked list?",
                "answer": "Initialize two pointers: slow moves 1 step at a time, fast moves 2 steps. If there is a cycle, the fast pointer will eventually lap the slow pointer and they will meet at the same node. If fast reaches null, there is no cycle. Runs in O(n) time and O(1) space.",
                "hint": "Imagine two runners on a circular track moving at 1 mile per hour and 2 miles per hour.",
                "key_points": ["slow pointer 1 step", "fast pointer 2 steps", "pointers meet if cycle", "fast hits null if no cycle", "O(1) space"],
                "voice_tip": "Call it the tortoise and hare algorithm.",
            },
            {
                "id": "ll_med_2",
                "question": "How do you reverse a singly linked list in-place iteratively?",
                "answer": "Maintain three pointers: prev initialized to null, curr initialized to head, and next_temp. In a loop while curr is not null: save curr.next into next_temp, point curr.next backward to prev, advance prev to curr, and advance curr to next_temp. Return prev as the new head.",
                "hint": "Keep track of three nodes: previous, current, and next.",
                "key_points": ["three pointers", "prev null", "save next", "reverse pointer", "advance curr and prev"],
                "voice_tip": "Walk through the four steps of pointer swapping.",
            },
        ],
        "hard": [
            {
                "id": "ll_hard_1",
                "question": "How do you merge k sorted linked lists with total N elements in O(N log k) time?",
                "answer": "Use a min-heap (priority queue) containing the head nodes of all k lists. Repeatedly pop the smallest node, attach it to the result list, and push that node's next element into the heap. With heap size k, each of the N nodes takes O(log k) to insert and extract.",
                "hint": "Use a min-heap initialized with the first node of each list.",
                "key_points": ["min-heap", "priority queue", "heap size k", "O(N log k)", "pop minimum and push next"],
                "voice_tip": "Highlight using a priority queue of size k.",
            },
        ],
    },
    "trees": {
        "easy": [
            {
                "id": "trees_easy_1",
                "question": "What is the maximum number of nodes in a binary tree of height h, where a single root node has height 0?",
                "answer": "2^(h + 1) - 1 nodes. For example, height 0 has 1 node, height 1 has 3 nodes, height 2 has 7 nodes.",
                "hint": "Sum the geometric series 2^0 + 2^1 + 2^2 up to 2^h.",
                "key_points": ["2^(h+1) - 1", "geometric sum", "doubles each level"],
                "voice_tip": "Say two to the power of h plus 1, minus 1.",
            },
        ],
        "medium": [
            {
                "id": "trees_med_1",
                "question": "How do you validate whether a binary tree is a valid Binary Search Tree (BST)?",
                "answer": "Traverse the tree recursively while maintaining a valid range (low, high) for each node. The root range is (-inf, +inf). For the left child, update upper bound to node.val. For the right child, update lower bound to node.val. Alternatively, verify that an in-order traversal produces a strictly increasing sequence.",
                "hint": "It is not enough to just check left < parent < right. The node must satisfy all ancestor constraints using low and high boundaries.",
                "key_points": ["min and max bounds", "ancestor constraints", "recursive range check", "in-order traversal is sorted"],
                "voice_tip": "Warn that checking only immediate children is a classic bug.",
            },
            {
                "id": "trees_med_2",
                "question": "What is the time and space complexity of in-order traversal of a binary tree?",
                "answer": "Time complexity is O(n) because every node is visited exactly once. Space complexity is O(h) where h is tree height, corresponding to the recursion call stack (O(log n) for balanced tree, O(n) for degenerate tree).",
                "hint": "Every node is visited once, and call stack space depends on height.",
                "key_points": ["O(n) time", "O(h) space", "call stack", "height dependent"],
                "voice_tip": "State O of n time and O of h space.",
            },
        ],
        "hard": [
            {
                "id": "trees_hard_1",
                "question": "How do you find the Lowest Common Ancestor (LCA) of two nodes p and q in a general binary tree?",
                "answer": "Use post-order traversal: if current node is null, p, or q, return current node. Recursively search left and right subtrees. If both left and right return non-null, current node is the LCA. If only one subtree returns non-null, propagate that non-null node upward.",
                "hint": "Think recursively bottom-up. What does it mean if p is found in the left subtree and q is found in the right subtree?",
                "key_points": ["post-order recursion", "base case p or q", "both children non-null means LCA", "propagate single non-null"],
                "voice_tip": "Explain that when left and right both return non-null, the current node is the split point.",
            },
        ],
    },
    "graphs": {
        "easy": [
            {
                "id": "graphs_easy_1",
                "question": "What primary data structure distinguishes Breadth-First Search (BFS) from Depth-First Search (DFS)?",
                "answer": "BFS uses a Queue (FIFO: First-In, First-Out) to explore nodes level-by-level, whereas DFS uses a Stack (LIFO: Last-In, First-Out) or recursive call stack to explore as deeply as possible.",
                "hint": "One is FIFO and explores level by level; the other is LIFO and goes deep along branches.",
                "key_points": ["BFS uses queue", "FIFO", "DFS uses stack or recursion", "LIFO", "level by level vs deep exploration"],
                "voice_tip": "Queue for BFS, stack or recursion for DFS.",
            },
        ],
        "medium": [
            {
                "id": "graphs_med_1",
                "question": "How does Dijkstra's algorithm find the shortest path from a single source in a weighted graph, and what is its time complexity with a min-heap?",
                "answer": "Maintain a distance table and a min-heap of (distance, vertex). Greedily extract the vertex with the smallest provisional distance, relax all its outgoing edges, and push updated distances into the heap. With a binary heap, time complexity is O((V + E) log V). Does not support negative edge weights.",
                "hint": "It is a greedy algorithm using a priority queue. Each relaxation updates the shortest tentative distance.",
                "key_points": ["greedy", "min-heap / priority queue", "edge relaxation", "O((V+E) log V)", "no negative weights"],
                "voice_tip": "Note that edge weights must be non-negative.",
            },
            {
                "id": "graphs_med_2",
                "question": "Explain Kahn's algorithm for Topological Sorting of a Directed Acyclic Graph (DAG).",
                "answer": "Calculate the in-degree of all vertices. Enqueue all vertices with in-degree 0 into a queue. While the queue is not empty, dequeue a vertex, append it to the topological order, and decrement the in-degree of its neighbors. If a neighbor reaches in-degree 0, enqueue it. If output count < V, the graph contains a cycle.",
                "hint": "Start with nodes that have zero incoming edges. Remove them and decrease incoming edge counts for their neighbors.",
                "key_points": ["in-degree", "queue of in-degree zero", "decrement neighbor in-degrees", "cycle detection if count < V", "O(V + E)"],
                "voice_tip": "Mention in-degree calculation and queue of zero in-degrees.",
            },
        ],
        "hard": [
            {
                "id": "graphs_hard_1",
                "question": "What is Tarjan's algorithm for finding Strongly Connected Components (SCCs) in a directed graph?",
                "answer": "Tarjan's algorithm performs a single DFS traversal maintaining discovery times (`ids`) and lowest reachable discovery times (`low-link` values), along with an active stack of visited nodes. When a node's discovery ID equals its low-link value, it is the root of an SCC, and nodes are popped from the stack until the root is reached. Runs in O(V + E) time.",
                "hint": "Uses low-link values and a stack within a single DFS pass.",
                "key_points": ["single DFS pass", "discovery time", "low-link value", "stack of active nodes", "O(V + E)"],
                "voice_tip": "Highlight low-link value and stack unwinding.",
            },
        ],
    },
    "dynamic_programming": {
        "easy": [
            {
                "id": "dp_easy_1",
                "question": "What are the two foundational properties a problem must possess to be solvable using Dynamic Programming?",
                "answer": "Optimal Substructure (an optimal solution to the problem contains optimal solutions to its subproblems) and Overlapping Subproblems (the same subproblems are solved multiple times rather than generating new subproblems).",
                "hint": "One property means big solutions are composed of small solutions; the other means identical subproblems recur repeatedly.",
                "key_points": ["optimal substructure", "overlapping subproblems", "memoization or tabulation"],
                "voice_tip": "Name optimal substructure and overlapping subproblems.",
            },
            {
                "id": "dp_easy_2",
                "question": "What is the difference between top-down memoization and bottom-up tabulation in dynamic programming?",
                "answer": "Top-down memoization uses recursion starting from the original problem down to base cases, caching results in a map or array. Bottom-up tabulation iteratively fills an array starting from base cases up to the target, avoiding recursion stack overhead.",
                "hint": "One starts from the top with recursion and a cache; the other builds iteratively from the base cases up.",
                "key_points": ["top-down recursion with cache", "bottom-up iterative table", "base cases to target", "call stack differences"],
                "voice_tip": "Contrast recursive caching with iterative table building.",
            },
        ],
        "medium": [
            {
                "id": "dp_med_1",
                "question": "Formulate the recurrence relation and space-optimized complexity for the 0/1 Knapsack problem.",
                "answer": "Let dp[w] be the maximum value achievable with capacity w. For each item with weight wt and value val, iterate w backwards from Capacity down to wt: dp[w] = max(dp[w], dp[w - wt] + val). Iterating backwards prevents using the same item multiple times. Time complexity is O(N * W), space complexity is O(W).",
                "hint": "For each item, you either take it or leave it. When using a 1D array, which direction do you iterate capacity to avoid reusing the item?",
                "key_points": ["take or leave choice", "dp[w] = max(dp[w], dp[w-wt] + val)", "iterate capacity backwards", "O(N*W) time", "O(W) space"],
                "voice_tip": "Emphasize iterating the capacity backwards in the 1D array.",
            },
            {
                "id": "dp_med_2",
                "question": "How do you find the Longest Common Subsequence (LCS) of two strings of lengths m and n?",
                "answer": "Build a 2D table dp[i][j]. If string1[i-1] == string2[j-1], dp[i][j] = 1 + dp[i-1][j-1]. Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]). Time complexity is O(m * n) and space complexity can be optimized to O(min(m, n)) by keeping only the previous row.",
                "hint": "If characters match, extend diagonal by 1. If they differ, take the max of top or left cell.",
                "key_points": ["dp[i][j] table", "match adds 1 to diagonal", "mismatch takes max of top and left", "O(m*n) time"],
                "voice_tip": "Say match adds one to diagonal, mismatch takes max of top and left.",
            },
        ],
        "hard": [
            {
                "id": "dp_hard_1",
                "question": "Describe the Levenshtein Edit Distance recurrence for transforming string A into string B using insertions, deletions, and replacements.",
                "answer": "dp[i][j] represents min edits to convert A[0..i] to B[0..j]. If A[i-1] == B[j-1], cost is dp[i-1][j-1]. If different, cost is 1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace)). Time and space complexities are O(m * n).",
                "hint": "Three choices on mismatch: insert, delete, or replace. Take 1 plus the minimum of those three prior states.",
                "key_points": ["Levenshtein distance", "insert / delete / replace", "1 + min of three neighbors", "O(m*n) time"],
                "voice_tip": "Name the three operations: insert, delete, and substitute.",
            },
        ],
    },
    "sorting": {
        "easy": [
            {
                "id": "sort_easy_1",
                "question": "What is the worst-case time complexity of Bubble Sort, and when does it occur?",
                "answer": "O(n^2), which occurs when the array is in reverse sorted order, requiring n*(n-1)/2 comparisons and swaps.",
                "hint": "Nested loops where every adjacent inversion must be swapped.",
                "key_points": ["O(n^2)", "quadratic time", "reverse sorted order", "adjacent swaps"],
                "voice_tip": "State big-O of n squared for reverse sorted input.",
            },
        ],
        "medium": [
            {
                "id": "sort_med_1",
                "question": "What is the average and worst-case time complexity of Quicksort, and how can the worst case be mitigated?",
                "answer": "Average is O(n log n). Worst case is O(n^2), occurring when the pivot is consistently the minimum or maximum element (e.g. sorted input with end pivot). Mitigate by using randomized pivot selection, median-of-three, or IntroSort.",
                "hint": "Worst case happens when partitions are unbalanced (size 0 and n-1). How do you pick a fairer pivot?",
                "key_points": ["O(n log n) average", "O(n^2) worst case", "unbalanced partitions", "random pivot or median of three"],
                "voice_tip": "Highlight randomized pivot selection or median-of-three.",
            },
            {
                "id": "sort_med_2",
                "question": "Is Merge Sort a stable sort, and what is its auxiliary space complexity?",
                "answer": "Yes, standard Merge Sort is stable (equal elements retain their relative original order). Its auxiliary space complexity is O(n) because of the temporary arrays used during the merge step.",
                "hint": "Stability means preserving original relative order of equivalent keys. What extra memory is needed to merge two sorted halves?",
                "key_points": ["stable", "preserves equal elements order", "O(n) auxiliary space", "merge buffer"],
                "voice_tip": "Clarify that it is stable and takes O of n extra space.",
            },
        ],
        "hard": [
            {
                "id": "sort_hard_1",
                "question": "How does Counting Sort break the O(n log n) comparison sort lower bound, and what are its constraints?",
                "answer": "Counting Sort is non-comparison based. It counts the frequencies of each distinct key into an array of size k, computes prefix sums to determine exact output positions, and places items into a result array. Runs in O(n + k) time and O(k) space. Only suitable when the range of integer keys k is not significantly larger than n.",
                "hint": "It doesn't compare elements against each other; it directly counts frequencies across a known discrete range k.",
                "key_points": ["non-comparison", "O(n + k) time", "frequency array and prefix sums", "requires discrete bounded integer range k"],
                "voice_tip": "Emphasize that it avoids comparisons by counting frequencies directly.",
            },
        ],
    },
    "searching": {
        "easy": [
            {
                "id": "search_easy_1",
                "question": "What is the time complexity of Binary Search on a sorted array of size n, and what is the recurrence relation?",
                "answer": "O(log n) time complexity. The recurrence relation is T(n) = T(n / 2) + O(1), halving the remaining search space with each comparison.",
                "hint": "You eliminate half the remaining candidates at each iteration.",
                "key_points": ["O(log n)", "logarithmic time", "T(n) = T(n/2) + 1", "halving search space"],
                "voice_tip": "Say big-O of log n, halving search space each step.",
            },
        ],
        "medium": [
            {
                "id": "search_med_1",
                "question": "How do you search for a target value in a rotated sorted array in O(log n) time?",
                "answer": "Use modified binary search: at any midpoint, at least one half (left..mid or mid..right) is guaranteed to be sorted. Check which half is sorted by comparing nums[left] <= nums[mid]. If the target lies within the boundaries of the sorted half, search there; otherwise search the other half.",
                "hint": "In any rotated sorted array, one half is always strictly sorted. Determine which half is sorted first.",
                "key_points": ["modified binary search", "one half is always sorted", "check if target falls in sorted half", "O(log n)"],
                "voice_tip": "Explain checking whether the left or right half is normally sorted.",
            },
        ],
        "hard": [
            {
                "id": "search_hard_1",
                "question": "How do you find the median of two sorted arrays of sizes m and n in O(log(min(m, n))) time?",
                "answer": "Perform binary search on the partition cut of the smaller array. Partition both arrays such that the combined left half contains (m + n + 1) // 2 elements. Ensure maxLeftA <= minRightB and maxLeftB <= minRightA. Once found, median is calculated from the boundary values.",
                "hint": "Binary search on the partition line of the shorter array instead of searching for an element directly.",
                "key_points": ["binary search on partition cut", "shorter array", "equal total halves", "boundary comparison", "O(log(min(m,n)))"],
                "voice_tip": "Highlight binary searching on the partition position of the smaller array.",
            },
        ],
    },
    "stacks_queues": {
        "easy": [
            {
                "id": "sq_easy_1",
                "question": "What are the time complexities of push, pop, and peek operations on a standard LIFO stack?",
                "answer": "O(1) constant time for all three operations, as they only read or modify the element at the top pointer of the stack.",
                "hint": "All operations take place strictly at the top of the container.",
                "key_points": ["O(1) constant time", "push", "pop", "peek", "top element only"],
                "voice_tip": "State constant time for all three operations.",
            },
        ],
        "medium": [
            {
                "id": "sq_med_1",
                "question": "How do you implement a FIFO Queue using two LIFO Stacks with amortized O(1) operations?",
                "answer": "Use stack_in for enqueue and stack_out for dequeue. For enqueue, push onto stack_in. For dequeue, if stack_out is empty, pop all elements from stack_in and push them onto stack_out (reversing their order to FIFO). Then pop from stack_out. Each element is moved at most twice, yielding amortized O(1).",
                "hint": "One stack accepts new items; the second serves popped items. Transfer items between them only when the second is empty.",
                "key_points": ["two stacks", "stack_in and stack_out", "transfer reverses order", "amortized O(1) time"],
                "voice_tip": "Describe pouring stack 1 into stack 2 to reverse order.",
            },
            {
                "id": "sq_med_2",
                "question": "How do you design a Min Stack that supports push, pop, top, and retrieving the minimum element all in O(1) time?",
                "answer": "Maintain a primary stack for values and an auxiliary min_stack that stores the current minimum at each height. When pushing x, push min(x, min_stack.top()) onto min_stack. When popping, pop from both stacks. Min element is always min_stack.top(). Alternatively, store pairs (val, current_min).",
                "hint": "Track the historical minimum alongside every pushed value using an auxiliary stack or tuple.",
                "key_points": ["auxiliary min stack", "push pair or parallel push", "pop both simultaneously", "O(1) getMin"],
                "voice_tip": "Explain maintaining a parallel stack of running minimums.",
            },
        ],
        "hard": [
            {
                "id": "sq_hard_1",
                "question": "How does a Monotonic Stack solve the Largest Rectangle in Histogram problem in O(n) time?",
                "answer": "Maintain a stack of bar indices with strictly increasing heights. When encountering a bar shorter than the stack top, pop the top index: its height was bounded on the right by current index and on the left by the new stack top. Width is (current_index - stack_top - 1). Compute area and update max. Each bar is pushed and popped at most once.",
                "hint": "Maintain an increasing stack of heights. When a drop occurs, pop and calculate the area for the popped bar.",
                "key_points": ["monotonic increasing stack", "pop on shorter bar", "width is right boundary minus left boundary minus 1", "O(n) time"],
                "voice_tip": "State that popping occurs when a shorter boundary is reached.",
            },
        ],
    },
    "hash_tables": {
        "easy": [
            {
                "id": "ht_easy_1",
                "question": "What is the average time complexity of insertion, deletion, and lookup in a hash table with a good hash function?",
                "answer": "O(1) average constant time, because the hash function converts the key into a bucket array index in constant time.",
                "hint": "Assuming uniform distribution and reasonable load factor.",
                "key_points": ["O(1) average time", "lookup, insert, delete", "hash function", "uniform distribution"],
                "voice_tip": "State big-O of 1 average time.",
            },
        ],
        "medium": [
            {
                "id": "ht_med_1",
                "question": "What is the difference between Separate Chaining and Open Addressing for hash collision resolution?",
                "answer": "Separate Chaining stores colliding keys in a linked list or tree at each bucket index; it degrades gracefully as load factor exceeds 1. Open Addressing stores all keys directly in the array; when a collision occurs, it probes alternate slots (linear, quadratic, double hashing) and requires load factor strictly less than 1.",
                "hint": "Chaining uses extra data structures attached to buckets; open addressing probes for other empty slots inside the main array.",
                "key_points": ["chaining uses linked lists/trees at buckets", "open addressing probes within array", "load factor constraints", "cache friendliness vs clustering"],
                "voice_tip": "Contrast buckets holding linked lists versus probing empty array slots.",
            },
        ],
        "hard": [
            {
                "id": "ht_hard_1",
                "question": "How does Double Hashing avoid primary and secondary clustering in open addressing hash tables?",
                "answer": "Double hashing calculates probe sequence using two hash functions: index = (h1(key) + i * h2(key)) % table_size. Because the step size h2(key) depends on the key itself rather than constant offset or quadratic step, different keys that collide on h1 follow distinct probe sequences, eliminating clustering. Table size should be prime and h2(key) must be co-prime to table size.",
                "hint": "The step size between successive probe checks is generated by a secondary hash function.",
                "key_points": ["two hash functions", "h1(key) + i * h2(key)", "step size depends on key", "eliminates primary and secondary clustering", "prime table size"],
                "voice_tip": "Mention that the secondary hash determines the step size.",
            },
        ],
    },
    "strings": {
        "easy": [
            {
                "id": "str_easy_1",
                "question": "How do you determine if a string is a palindrome in O(n) time and O(1) space?",
                "answer": "Initialize two pointers: left at index 0 and right at index n-1. While left < right, compare characters at both pointers. If they differ, it is not a palindrome. Otherwise increment left and decrement right. If pointers meet, it is a palindrome.",
                "hint": "Compare characters inward from both ends.",
                "key_points": ["two pointers", "left 0 and right n-1", "move inward", "O(n) time", "O(1) space"],
                "voice_tip": "Describe two pointers comparing characters moving inward.",
            },
        ],
        "medium": [
            {
                "id": "str_med_1",
                "question": "How does the Knuth-Morris-Pratt (KMP) algorithm achieve O(n + m) substring search without backtracking?",
                "answer": "KMP precomputes a Longest Prefix Suffix (LPS) array for pattern of length m in O(m). When a mismatch occurs during text scan at pattern index j, instead of restarting text pointer, KMP shifts pattern to j = LPS[j-1], skipping redundant character comparisons. Total time is O(n + m).",
                "hint": "Precomputes an LPS (Longest Prefix Suffix) array that tells how far to fall back without rewinding the text pointer.",
                "key_points": ["LPS array", "longest prefix suffix", "no text backtracking", "O(n + m) time"],
                "voice_tip": "Call it the LPS or prefix function table.",
            },
            {
                "id": "str_med_2",
                "question": "How does the sliding window technique find the length of the longest substring without repeating characters in O(n) time?",
                "answer": "Maintain left pointer and right pointer with a hash map storing the most recent index of each character. As right expands, if the character was seen at index >= left, update left = seen[char] + 1. Calculate window length (right - left + 1) and update max. Runs in O(n) time and O(min(m, n)) space.",
                "hint": "Expand right pointer, and if a duplicate appears inside current window, jump left pointer past its previous occurrence.",
                "key_points": ["sliding window", "hash map of last seen indices", "jump left pointer", "O(n) linear time"],
                "voice_tip": "Explain jumping the left pointer past duplicate occurrences.",
            },
        ],
        "hard": [
            {
                "id": "str_hard_1",
                "question": "How does the Rabin-Karp algorithm use a rolling hash for pattern matching in average O(n + m) time?",
                "answer": "Compute hash of pattern and first window of text using polynomial rolling hash (e.g. base B modulo prime M). To slide window one character right in O(1): subtract leftmost character's contribution (char * B^(m-1)), multiply by B, and add new character. If hash values match, verify string equality to handle hash collisions. Worst case O(n * m), average O(n + m).",
                "hint": "Update window hash in O(1) by subtracting outgoing character and adding incoming character like a sliding number.",
                "key_points": ["rolling hash", "polynomial hash", "O(1) window update", "verify on collision", "average O(n+m)"],
                "voice_tip": "Describe updating hash in O(1) by dropping the left char and adding the right.",
            },
        ],
    },
}
