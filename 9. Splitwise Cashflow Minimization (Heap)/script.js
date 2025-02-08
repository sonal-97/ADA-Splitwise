import { BinaryHeap } from './heap.js';

onload = function () {
    let curr_data;
    const container = document.getElementById('mynetwork');
    const container2 = document.getElementById('mynetwork2');
    const genNew = document.getElementById('generate-graph');
    const solve = document.getElementById('solve');

    const numPeopleInput = document.getElementById('numPeople');
    const setPeopleBtn = document.getElementById('setPeople');
    const peopleInputs = document.getElementById('peopleInputs');
    const fromPersonSelect = document.getElementById('fromPerson');
    const toPersonSelect = document.getElementById('toPerson');
    const amountInput = document.getElementById('amount');
    const addTransactionBtn = document.getElementById('addTransaction');
    const transactionList = document.getElementById('transactionList');

    let peopleMap = {};
    let transactions = [];

    const options = {
        edges: {
            arrows: { to: true },
            labelHighlightBold: true,
            font: { size: 20 }
        },
        nodes: {
            font: '12px arial red',
            scaling: { label: true },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf183',
                size: 50,
                color: '#991133',
            }
        }
    };

    let network = new vis.Network(container);
    network.setOptions(options);
    let network2 = new vis.Network(container2);
    network2.setOptions(options);

    setPeopleBtn.onclick = function () {
        let sz = parseInt(numPeopleInput.value);
        if (isNaN(sz) || sz <= 0) {
            alert("Enter a valid number of people.");
            return;
        }

        peopleInputs.innerHTML = "";
        peopleMap = {};
        fromPersonSelect.innerHTML = "";
        toPersonSelect.innerHTML = "";

        for (let i = 1; i <= sz; i++) {
            let div = document.createElement("div");
            let input = document.createElement("input");
            input.type = "text";
            input.placeholder = `Person ${i} Name/ID`;
            input.id = `person${i}`;
            div.appendChild(input);
            peopleInputs.appendChild(div);
        }

        let submitBtn = document.createElement("button");
        submitBtn.textContent = "Confirm People";
        submitBtn.onclick = function () {
            let allValid = true;
            for (let i = 1; i <= sz; i++) {
                let name = document.getElementById(`person${i}`).value.trim();
                if (!name) {
                    allValid = false;
                    break;
                }
                peopleMap[name] = i;
                let option1 = new Option(name, name);
                let option2 = new Option(name, name);
                fromPersonSelect.add(option1);
                toPersonSelect.add(option2);
            }

            if (!allValid) {
                alert("All names must be filled.");
                return;
            }
            submitBtn.disabled = true;
            setPeopleBtn.disabled = true;
        };
        peopleInputs.appendChild(submitBtn);
    };

    addTransactionBtn.onclick = function () {
        let from = fromPersonSelect.value;
        let to = toPersonSelect.value;
        let amount = parseInt(amountInput.value);

        if (!from || !to || from === to || isNaN(amount) || amount <= 0) {
            alert("Enter a valid transaction.");
            return;
        }

        transactions.push({ from, to, amount });
        let listItem = document.createElement("li");
        listItem.textContent = `${from} owes ${to} $${amount}`;
        transactionList.appendChild(listItem);

        amountInput.value = "";
    };

    genNew.onclick = function () {
        const nodes = Object.keys(peopleMap).map(name => ({ id: peopleMap[name], label: name }));
        const edges = transactions.map(t => ({
            from: peopleMap[t.from],
            to: peopleMap[t.to],
            label: String(t.amount)
        }));

        const data = { nodes, edges };
        curr_data = data;
        network.setData(data);
    };

    solve.onclick = function () {
        document.getElementById("temptext").style.display = "none"; // Hide the instruction text
        container2.style.display = "block"; // Show the optimised graph
        const solvedData = solveData();
        network2.setData(solvedData);
    };
    

    function solveData() {
        let data = curr_data;
        const sz = data.nodes.length;
        const vals = Array(sz).fill(0);

        data.edges.forEach(edge => {
            vals[edge.to - 1] += parseInt(edge.label);
            vals[edge.from - 1] -= parseInt(edge.label);
        });

        const pos_heap = new BinaryHeap();
        const neg_heap = new BinaryHeap();

        vals.forEach((val, i) => {
            if (val > 0) pos_heap.insert([val, i]);
            else if (val < 0) neg_heap.insert([-val, i]);
        });

        const new_edges = [];
        while (!pos_heap.empty() && !neg_heap.empty()) {
            const mx = pos_heap.extractMax();
            const mn = neg_heap.extractMax();

            new_edges.push({ from: mn[1] + 1, to: mx[1] + 1, label: String(Math.min(mx[0], mn[0])) });
        }

        return { nodes: data.nodes, edges: new_edges };
    }
};
