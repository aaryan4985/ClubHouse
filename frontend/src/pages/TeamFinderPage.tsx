import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Loader2, Users, Search, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  languages?: string[];
  email: string;
}

const TeamFinderPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [sortedByMatch, setSortedByMatch] = useState(false);
  const [currentUserLanguages, setCurrentUserLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Calculate match score between current user and another user
  const calculateMatchScore = (userLanguages?: string[]): number => {
    if (!userLanguages || !currentUserLanguages.length) return 0;
    return userLanguages.filter(lang => 
      currentUserLanguages.includes(lang)
    ).length;
  };

  // Fetch users data from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);
        
        const fetchedUsers: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });

        // Filter out current user
        const currentUid = auth.currentUser?.uid;
        const otherUsers = fetchedUsers.filter(user => user.uid !== currentUid);
        
        setUsers(otherUsers);
        setFilteredUsers(otherUsers);

        // Get current user's languages
        const currentUser = fetchedUsers.find(user => user.uid === currentUid);
        setCurrentUserLanguages(currentUser?.languages || []);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    const filtered = users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.bio?.toLowerCase().includes(searchLower) ||
        user.languages?.some(lang => 
          lang.toLowerCase().includes(searchLower)
        )
      );
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Handle sorting by match score
  const handleSort = () => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const scoreA = calculateMatchScore(a.languages);
      const scoreB = calculateMatchScore(b.languages);
      return scoreB - scoreA;
    });
    setFilteredUsers(sorted);
    setSortedByMatch(true);
  };

  // Reset sorting and filtering
  const handleReset = () => {
    setFilteredUsers(users);
    setSearchTerm('');
    setSortedByMatch(false);
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header currentUser={auth.currentUser} handleLogout={() => auth.signOut()} />
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-700">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header currentUser={auth.currentUser} handleLogout={() => auth.signOut()} />
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <Loader2 className="w-8 h-8 text-white animate-spin mb-4" />
          <p className="text-lg text-white font-medium">Finding potential team members...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header currentUser={auth.currentUser} handleLogout={() => auth.signOut()} />
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <Users className="w-16 h-16 text-white mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Users Found</h2>
          <p className="text-white/80">Be the first to join the community!</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentUser={auth.currentUser} handleLogout={() => auth.signOut()} />
      <main className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-600 bg-clip-text text-transparent mb-2">
                  Find Team Members
                </h1>
                <p className="text-gray-600">Connect with developers who share your programming interests</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleSort}
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white"
                  disabled={sortedByMatch}
                >
                  Sort by Match
                </Button>
                <Button 
                  onClick={handleReset}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, language, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white border-2 border-purple-100 focus:border-purple-300 rounded-xl"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-xl">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No matches found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => {
                  const matchScore = calculateMatchScore(user.languages);

                  return (
                    <Card key={user.uid} className="hover:shadow-xl transition-all border-purple-100/50 hover:border-purple-200 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <div className="relative">
                          <img
                            src={user.photoURL || '/default-avatar.png'}
                            alt={user.displayName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                          />
                          {matchScore > 0 && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                              {matchScore}
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">{user.displayName}</CardTitle>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-700">Bio</h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {user.bio || 'No bio provided'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 text-gray-700">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {user.languages?.map((lang) => (
                                <span
                                  key={lang}
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    currentUserLanguages.includes(lang)
                                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 ring-1 ring-green-200'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {lang}
                                </span>
                              ))}
                              {!user.languages?.length && (
                                <span className="text-sm text-gray-500">No languages specified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamFinderPage;