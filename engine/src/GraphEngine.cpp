#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include "json.hpp"

using json = nlohmann::json;
using namespace std;

class GraphEngine {
public:
    unordered_map<string, vector<string>> forwardAdj;
    unordered_map<string, vector<string>> reverseAdj;
    unordered_map<string, int> inDegree;
    unordered_set<string> nodes;

    void addNode(const string& node) {
        nodes.insert(node);
        if (forwardAdj.find(node) == forwardAdj.end()) {
            forwardAdj[node] = vector<string>();
        }
        if (reverseAdj.find(node) == reverseAdj.end()) {
            reverseAdj[node] = vector<string>();
        }
        if (inDegree.find(node) == inDegree.end()) {
            inDegree[node] = 0;
        }
    }

    void addEdge(const string& source, const string& target) {
        // source depends on target: source -> target
        forwardAdj[source].push_back(target);
        reverseAdj[target].push_back(source); // reverse graph for impact analysis
        inDegree[target]++;
    }

    // BFS to find all affected nodes using reverse graph
    unordered_set<string> getAffectedModules(const vector<string>& changedModules) {
        unordered_set<string> affected;
        queue<string> q;

        for (const string& mod : changedModules) {
            if (nodes.count(mod)) {
                q.push(mod);
                affected.insert(mod);
            }
        }

        while (!q.empty()) {
            string curr = q.front();
            q.pop();

            for (const string& neighbor : reverseAdj[curr]) {
                if (affected.find(neighbor) == affected.end()) {
                    affected.insert(neighbor);
                    q.push(neighbor);
                }
            }
        }

        return affected;
    }

    // Topological Sort on affected sub-graph
    struct TopoResult {
        vector<string> order;
        bool hasCycle;
        vector<string> cycleNodes;
    };

    TopoResult topologicalSort(const unordered_set<string>& subset) {
        TopoResult res;
        res.hasCycle = false;

        unordered_map<string, int> localInDegree;
        unordered_map<string, vector<string>> localAdj;

        // Initialize local in-degrees and build local adjacency list (reverse direction of dependency!)
        // Wait, for build order: if A depends on B (A->B), B must be built BEFORE A.
        // So the build edges should go B -> A.
        // We want to sort such that B comes before A.
        // Our 'reverseAdj' has B -> A (dependents).
        
        for (const string& u : subset) {
            localInDegree[u] = 0;
        }

        for (const string& u : subset) {
            for (const string& v : reverseAdj[u]) {
                if (subset.count(v)) {
                    // u -> v in reverseAdj (meaning v depends on u, so u must be built before v)
                    localAdj[u].push_back(v);
                    localInDegree[v]++;
                }
            }
        }

        queue<string> q;
        for (const auto& pair : localInDegree) {
            if (pair.second == 0) {
                q.push(pair.first);
            }
        }

        while (!q.empty()) {
            string curr = q.front();
            q.pop();
            res.order.push_back(curr);

            for (const string& neighbor : localAdj[curr]) {
                localInDegree[neighbor]--;
                if (localInDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }

        if (res.order.size() != subset.size()) {
            res.hasCycle = true;
            for (const auto& pair : localInDegree) {
                if (pair.second > 0) {
                    res.cycleNodes.push_back(pair.first);
                }
            }
        }

        return res;
    }
};

int main() {
    // Optimization for fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string inputStr;
    string line;
    while (getline(cin, line)) {
        inputStr += line;
    }

    if (inputStr.empty()) {
        cerr << "No input provided." << endl;
        return 1;
    }

    try {
        json input = json::parse(inputStr);
        GraphEngine engine;

        for (const auto& mod : input["modules"]) {
            engine.addNode(mod.get<string>());
        }

        for (const auto& edge : input["dependencies"]) {
            engine.addEdge(edge[0].get<string>(), edge[1].get<string>());
        }

        vector<string> changedModules;
        for (const auto& mod : input["changedModules"]) {
            changedModules.push_back(mod.get<string>());
        }

        auto affected = engine.getAffectedModules(changedModules);
        auto topoRes = engine.topologicalSort(affected);

        json output;
        vector<string> affectedVec(affected.begin(), affected.end());
        output["affectedModules"] = affectedVec;
        output["buildOrder"] = topoRes.order;
        output["cycleDetected"] = topoRes.hasCycle;
        
        vector<vector<string>> cycles;
        if (topoRes.hasCycle) {
            cycles.push_back(topoRes.cycleNodes);
        }
        output["cycles"] = cycles;

        cout << output.dump() << endl;

    } catch (const exception& e) {
        cerr << "JSON Parsing or Execution Error: " << e.what() << endl;
        return 1;
    }

    return 0;
}
