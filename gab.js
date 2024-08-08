document.addEventListener('DOMContentLoaded', () => {
    let users = []; // Tableau pour stocker les utilisateurs
    let currentUser = null; // Utilisateur actuellement connecté

    // Chargement des utilisateurs depuis le localStorage
    function loadUsers() {
        const usersFromStorage = localStorage.getItem('users'); // Récupère les utilisateurs stockés
        if (usersFromStorage) {
            users = JSON.parse(usersFromStorage); // Parse les utilisateurs récupérés
        } else {
            // Initialisation des utilisateurs par défaut s'ils ne sont pas présents dans le localStorage
            users = [
                { id: 1234, nom: 'Niassy', prenom: 'Lamine', password: 5000, solde: 100000, blocked: false, attempts: 0 },
                { id: 1235, nom: 'Tine', prenom: 'Ahmadou', password: 5001, solde: 500000, blocked: false, attempts: 0 },
                { id: 1236, nom: 'Gueye', prenom: 'Mafama', password: 5002, solde: 30000, blocked: false, attempts: 0 },
                { id: 1237, nom: 'Dieng', prenom: 'Moustapha', password: 5003, solde: 105000, blocked: false, attempts: 0 },
                { id: 1238, nom: 'Diatta', prenom: 'Antoine', password: 5004, solde: 50000, blocked: false, attempts: 0 }
            ];
            localStorage.setItem('users', JSON.stringify(users)); // Sauvegarde les utilisateurs dans le localStorage
        }
    }

    // Sauvegarde des utilisateurs dans le localStorage
    function saveUsers() {
        localStorage.setItem('users', JSON.stringify(users)); // Convertit les utilisateurs en JSON et les sauvegarde
    }

    // Fonction pour générer un numéro de reçu unique
    function getNextReceiptNumber() {
        let receiptNumber = parseInt(localStorage.getItem('receiptNumber') || '0', 10); // Récupère le numéro de reçu actuel ou initialise à 0
        receiptNumber++; // Incrémente le numéro de reçu
        if (receiptNumber > 999999) {
            receiptNumber = 1; // Réinitialisation si le nombre dépasse 6 chiffres
        }
        localStorage.setItem('receiptNumber', receiptNumber.toString().padStart(6, '0')); // Sauvegarde le numéro de reçu formaté
        return localStorage.getItem('receiptNumber'); // Retourne le numéro de reçu
    }

    loadUsers(); // Charge les utilisateurs au démarrage

    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm'); // Récupère le formulaire de connexion
        const messageDiv = document.getElementById('message'); // Récupère la zone des messages

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche l'envoi du formulaire par défaut
            const userId = document.getElementById('userId').value; // Récupère l'ID utilisateur
            const password = document.getElementById('password').value; // Récupère le mot de passe

            // Vérifie que l'ID utilisateur contient exactement 4 chiffres
            if (userId.length !== 4 || isNaN(userId)) {
                showMessage('ID Utilisateur doit contenir exactement 4 chiffres');
                resetInputs(); // Réinitialise les champs de saisie
                return;
            }

            // Vérifie que le mot de passe contient exactement 4 chiffres
            if (password.length !== 4 || isNaN(password)) {
                showMessage('Mot de Passe doit contenir exactement 4 chiffres');
                resetInputs(); // Réinitialise les champs de saisie
                return;
            }

            const user = users.find(user => user.id === parseInt(userId)); // Cherche l'utilisateur correspondant

            if (!user) {
                showMessage('ID Utilisateur incorrect'); // Affiche un message si l'ID est incorrect
                resetInputs(); // Réinitialise les champs de saisie
            } else if (user.blocked) {
                showMessage('Votre compte est bloqué. Contactez le service client.'); // Affiche un message si le compte est bloqué
                resetInputs(); // Réinitialise les champs de saisie
            } else if (user.password !== parseInt(password)) {
                showMessage('Mot de Passe incorrect'); // Affiche un message si le mot de passe est incorrect
                user.attempts++; // Incrémente le nombre de tentatives échouées
                if (user.attempts >= 3) {
                    user.blocked = true; // Bloque l'utilisateur après 3 tentatives échouées
                    showMessage(`Vous avez atteint le nombre maximal de tentatives. Vous êtes bloqué. Contactez le service client.`);
                    loginForm.querySelector('button').disabled = true; // Désactive le bouton de soumission
                } else {
                    showMessage(`Mot de Passe incorrect (${3 - user.attempts} tentatives restantes)`); // Affiche les tentatives restantes
                }
                resetInputs(); // Réinitialise les champs de saisie
                saveUsers(); // Sauvegarde les modifications
            } else {
                user.attempts = 0; // Réinitialise les tentatives échouées
                currentUser = user; // Définit l'utilisateur actuellement connecté
                localStorage.setItem('currentUserId', user.id); // Sauvegarde l'ID de l'utilisateur connecté
                saveUsers(); // Sauvegarde les modifications
                window.location.href = 'consultation_retrait.html'; // Redirige vers la page de consultation et retrait
            }
        });

        // Affiche un message avec une durée d'affichage
        function showMessage(message, duration = 3000) {
            messageDiv.innerHTML = message;
            setTimeout(() => {
                messageDiv.innerHTML = ''; // Efface le message après la durée spécifiée
            }, duration);
        }

        // Réinitialise les champs de saisie
        function resetInputs() {
            document.getElementById('userId').value = ''; // Réinitialise le champ ID utilisateur
            document.getElementById('password').value = ''; // Réinitialise le champ mot de passe
        }
    }

    if (document.getElementById('consult') || document.getElementById('withdraw')) {
        const withdrawalOptionsDiv = document.getElementById('withdrawal-options'); // Récupère la zone des options de retrait
        const messageDiv = document.getElementById('message'); // Récupère la zone des messages
        const receiptDiv = document.getElementById('receipt'); // Récupère la zone du reçu
        const receiptContentDiv = document.getElementById('receipt-content'); // Récupère le contenu du reçu
        const closeReceiptBtn = document.getElementById('close-receipt'); // Récupère le bouton de fermeture du reçu
        const userId = parseInt(localStorage.getItem('currentUserId')); // Récupère l'ID de l'utilisateur connecté

        loadUsers(); // Recharge les utilisateurs
        currentUser = users.find(user => user.id === userId); // Trouve l'utilisateur connecté

        if (!currentUser) {
            showMessage('Utilisateur non trouvé. Veuillez vous reconnecter.', 3000); // Affiche un message avec une durée d'affichage
            setTimeout(() => {
                window.location.href = 'accueil_gab.html'; // Redirige vers la page d'accueil après 3 secondes
            }, 3000);
            return;
        }

        // Affiche un message dans la zone des messages
        function showMessage(message, duration = 3000) {
            messageDiv.innerHTML = message;
            setTimeout(() => {
                messageDiv.innerHTML = ''; // Efface le message après la durée spécifiée
            }, duration);
        }

        // Valide le montant du retrait
        function validateAmount(amount) {
            const parsedAmount = parseInt(amount, 10); // Parse le montant en entier
            if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount % 1000 !== 0) {
                showMessage('Le montant doit être un multiple de 1.000.'); // Affiche un message si le montant n'est pas valide
                return false;
            }
            return true;
        }

        // Met à jour le solde après un retrait et affiche le reçu
        function updateBalance(amount) {
            if (currentUser && currentUser.solde >= amount) {
                currentUser.solde -= amount; // Déduit le montant du solde
                const receiptNumber = getNextReceiptNumber(); // Obtient un nouveau numéro de reçu
                const receipt = `
                    <p>Numéro du reçu: ${receiptNumber}</p>
                    <p>Nom: ${currentUser.nom}</p>
                    <p>Prénom: ${currentUser.prenom}</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                    <p>Montant retiré: ${amount} francs/CFA</p>
                    <p>Solde restant: ${currentUser.solde} francs/CFA</p>
                `;
                showReceipt(receipt); // Affiche le reçu
                saveUsers(); // Sauvegarde les modifications
                resetInputs(); // Réinitialise les champs de saisie
            } else if (currentUser && currentUser.solde < amount) {
                showMessage('Solde insuffisant.'); // Affiche un message si le solde est insuffisant
                resetInputs(); // Réinitialise les champs de saisie
            } else {
                showMessage('Utilisateur non trouvé.'); // Affiche un message si l'utilisateur n'est pas trouvé
                resetInputs(); // Réinitialise les champs de saisie
            }
        }

        // Affiche le reçu
        function showReceipt(receipt) {
            receiptContentDiv.innerHTML = receipt;
            receiptDiv.style.display = 'block'; // Affiche la zone du reçu
        }

        document.getElementById('consult').addEventListener('click', () => {
            if (currentUser) {
                showMessage(`Bonjour ${currentUser.prenom} ${currentUser.nom}, vous avez un solde de ${currentUser.solde} francs/CFA.`); // Affiche le solde de l'utilisateur
                document.getElementById('consult').style.display = 'none'; // Cache le bouton de consultation
                document.getElementById('withdraw').style.display = 'block'; // Affiche le bouton de retrait
            } else {
                showMessage('Aucun utilisateur connecté.'); // Affiche un message si aucun utilisateur n'est connecté
            }
        });

        document.getElementById('withdraw').addEventListener('click', () => {
            withdrawalOptionsDiv.style.display = 'block'; // Affiche les options de retrait
            document.getElementById('withdraw').style.display = 'none'; // Cache le bouton de retrait
        });

        document.querySelectorAll('.withdraw-option').forEach(button => {
            button.addEventListener('click', () => {
                const amount = parseInt(button.getAttribute('data-amount'), 10); // Récupère le montant à retirer
                if (validateAmount(amount)) {
                    updateBalance(amount); // Met à jour le solde et affiche le reçu
                }
            });
        });

        document.getElementById('other-withdrawal').addEventListener('click', () => {
            document.getElementById('custom-amount').style.display = 'block'; // Affiche le champ de montant personnalisé
            document.getElementById('custom-buttons').style.display = 'flex'; // Affiche les boutons pour montant personnalisé
        });

        document.getElementById('submit-withdrawal').addEventListener('click', () => {
            const amount = document.getElementById('custom-amount').value; // Récupère le montant personnalisé
            if (validateAmount(amount)) {
                updateBalance(parseInt(amount, 10)); // Met à jour le solde et affiche le reçu
            }
        });

        document.getElementById('cancel-withdrawal').addEventListener('click', () => {
            document.getElementById('custom-amount').style.display = 'none'; // Cache le champ de montant personnalisé
            document.getElementById('custom-buttons').style.display = 'none'; // Cache les boutons pour montant personnalisé
            document.getElementById('custom-amount').value = ''; // Réinitialise le champ de montant personnalisé
        });

        // Gestion de la déconnexion
        document.getElementById('logout').addEventListener('click', () => {
            localStorage.removeItem('currentUserId'); // Supprime l'ID utilisateur du localStorage
            window.location.href = 'accueil_gab.html'; // Redirige vers la page d'accueil
        });

        // Réinitialise le champ de montant personnalisé
        function resetInputs() {
            document.getElementById('custom-amount').value = ''; // Réinitialise le champ de montant personnalisé
        }

        closeReceiptBtn.addEventListener('click', () => {
            receiptDiv.style.display = 'none'; // Cache la zone du reçu
        });
    }
});
