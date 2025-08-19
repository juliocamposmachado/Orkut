/**
 * LocalStorage Manager - Orkut 2025
 * Gerencia todas as interações locais antes da sincronização com o backend
 */

class LocalStorageManager {
    constructor() {
        this.keys = {
            SCRAPS: 'orkut_scraps',
            TESTIMONIALS: 'orkut_testimonials',
            PHOTOS: 'orkut_photos',
            PROFILE_VISITS: 'orkut_profile_visits',
            INTERACTIONS: 'orkut_interactions',
            CRUSH_DATA: 'orkut_crush_data',
            USER_PROFILE: 'orkut_user_profile',
            PENDING_SYNC: 'orkut_pending_sync'
        };
        
        this.initializeStorage();
    }

    initializeStorage() {
        // Inicializa estruturas se não existirem
        Object.values(this.keys).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // Inicializa dados do usuário se não existir
        if (!localStorage.getItem(this.keys.USER_PROFILE)) {
            localStorage.setItem(this.keys.USER_PROFILE, JSON.stringify({
                id: this.generateId(),
                name: '',
                bio: '',
                photos: [],
                friends: [],
                crushes: [],
                visitedBy: []
            }));
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // SCRAPS
    addScrap(fromUserId, toUserId, message, isPrivate = false) {
        const scraps = this.getScraps();
        const newScrap = {
            id: this.generateId(),
            fromUserId,
            toUserId,
            message,
            isPrivate,
            timestamp: new Date().toISOString(),
            synced: false
        };
        
        scraps.push(newScrap);
        localStorage.setItem(this.keys.SCRAPS, JSON.stringify(scraps));
        this.addToPendingSync('scrap', newScrap);
        
        return newScrap;
    }

    getScraps() {
        return JSON.parse(localStorage.getItem(this.keys.SCRAPS) || '[]');
    }

    getScrapsByUser(userId) {
        const scraps = this.getScraps();
        return scraps.filter(s => s.fromUserId === userId || s.toUserId === userId);
    }

    // DEPOIMENTOS/TESTIMONIALS
    addTestimonial(fromUserId, toUserId, message, rating = 5) {
        const testimonials = this.getTestimonials();
        const newTestimonial = {
            id: this.generateId(),
            fromUserId,
            toUserId,
            message,
            rating,
            timestamp: new Date().toISOString(),
            synced: false
        };
        
        testimonials.push(newTestimonial);
        localStorage.setItem(this.keys.TESTIMONIALS, JSON.stringify(testimonials));
        this.addToPendingSync('testimonial', newTestimonial);
        
        return newTestimonial;
    }

    getTestimonials() {
        return JSON.parse(localStorage.getItem(this.keys.TESTIMONIALS) || '[]');
    }

    getTestimonialsForUser(userId) {
        const testimonials = this.getTestimonials();
        return testimonials.filter(t => t.toUserId === userId);
    }

    // FOTOS
    addPhoto(userId, photoData, caption = '', album = 'default') {
        const photos = this.getPhotos();
        const newPhoto = {
            id: this.generateId(),
            userId,
            photoData, // base64 ou URL
            caption,
            album,
            likes: [],
            comments: [],
            timestamp: new Date().toISOString(),
            synced: false
        };
        
        photos.push(newPhoto);
        localStorage.setItem(this.keys.PHOTOS, JSON.stringify(photos));
        this.addToPendingSync('photo', newPhoto);
        
        return newPhoto;
    }

    getPhotos() {
        return JSON.parse(localStorage.getItem(this.keys.PHOTOS) || '[]');
    }

    getPhotosByUser(userId) {
        const photos = this.getPhotos();
        return photos.filter(p => p.userId === userId);
    }

    likePhoto(photoId, userId) {
        const photos = this.getPhotos();
        const photo = photos.find(p => p.id === photoId);
        
        if (photo && !photo.likes.includes(userId)) {
            photo.likes.push(userId);
            localStorage.setItem(this.keys.PHOTOS, JSON.stringify(photos));
            this.addToPendingSync('photo_like', { photoId, userId });
        }
    }

    // VISITAS DO PERFIL
    recordProfileVisit(visitorId, visitedUserId) {
        const visits = this.getProfileVisits();
        const existingVisit = visits.find(v => 
            v.visitorId === visitorId && v.visitedUserId === visitedUserId
        );

        if (existingVisit) {
            existingVisit.count += 1;
            existingVisit.lastVisit = new Date().toISOString();
        } else {
            visits.push({
                id: this.generateId(),
                visitorId,
                visitedUserId,
                count: 1,
                firstVisit: new Date().toISOString(),
                lastVisit: new Date().toISOString(),
                synced: false
            });
        }
        
        localStorage.setItem(this.keys.PROFILE_VISITS, JSON.stringify(visits));
        this.addToPendingSync('profile_visit', { visitorId, visitedUserId });
    }

    getProfileVisits() {
        return JSON.parse(localStorage.getItem(this.keys.PROFILE_VISITS) || '[]');
    }

    getVisitsForUser(userId) {
        const visits = this.getProfileVisits();
        return visits.filter(v => v.visitedUserId === userId);
    }

    // INTERAÇÕES GERAIS
    recordInteraction(fromUserId, toUserId, type, data = {}) {
        const interactions = this.getInteractions();
        const newInteraction = {
            id: this.generateId(),
            fromUserId,
            toUserId,
            type, // 'like', 'comment', 'visit', 'message', etc.
            data,
            timestamp: new Date().toISOString(),
            synced: false
        };
        
        interactions.push(newInteraction);
        localStorage.setItem(this.keys.INTERACTIONS, JSON.stringify(interactions));
        this.addToPendingSync('interaction', newInteraction);
        
        return newInteraction;
    }

    getInteractions() {
        return JSON.parse(localStorage.getItem(this.keys.INTERACTIONS) || '[]');
    }

    // DADOS PARA CRUSH IA
    updateCrushData(userId, crushData) {
        const allCrushData = this.getCrushData();
        const existingData = allCrushData.find(c => c.userId === userId);
        
        if (existingData) {
            Object.assign(existingData, crushData);
        } else {
            allCrushData.push({
                userId,
                ...crushData,
                lastUpdated: new Date().toISOString()
            });
        }
        
        localStorage.setItem(this.keys.CRUSH_DATA, JSON.stringify(allCrushData));
    }

    getCrushData() {
        return JSON.parse(localStorage.getItem(this.keys.CRUSH_DATA) || '[]');
    }

    getCrushDataForUser(userId) {
        const crushData = this.getCrushData();
        return crushData.find(c => c.userId === userId) || null;
    }

    // SINCRONIZAÇÃO
    addToPendingSync(type, data) {
        const pending = this.getPendingSync();
        pending.push({
            id: this.generateId(),
            type,
            data,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem(this.keys.PENDING_SYNC, JSON.stringify(pending));
    }

    getPendingSync() {
        return JSON.parse(localStorage.getItem(this.keys.PENDING_SYNC) || '[]');
    }

    markAsSynced(syncId) {
        const pending = this.getPendingSync();
        const filtered = pending.filter(p => p.id !== syncId);
        localStorage.setItem(this.keys.PENDING_SYNC, JSON.stringify(filtered));
    }

    clearPendingSync() {
        localStorage.setItem(this.keys.PENDING_SYNC, JSON.stringify([]));
    }

    // PERFIL DO USUÁRIO
    updateUserProfile(profileData) {
        const currentProfile = this.getUserProfile();
        const updatedProfile = { ...currentProfile, ...profileData };
        localStorage.setItem(this.keys.USER_PROFILE, JSON.stringify(updatedProfile));
        this.addToPendingSync('profile_update', updatedProfile);
        return updatedProfile;
    }

    getUserProfile() {
        return JSON.parse(localStorage.getItem(this.keys.USER_PROFILE) || '{}');
    }

    // ESTATÍSTICAS
    getStatistics() {
        return {
            scraps: this.getScraps().length,
            testimonials: this.getTestimonials().length,
            photos: this.getPhotos().length,
            interactions: this.getInteractions().length,
            pendingSync: this.getPendingSync().length,
            profileVisits: this.getProfileVisits().length
        };
    }

    // LIMPEZA
    clearAllData() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeStorage();
    }
}

// Singleton instance
window.localStorageManager = new LocalStorageManager();

export default LocalStorageManager;
