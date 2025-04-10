"use client";

import { useState, useEffect } from 'react';
import { GoalInput } from '@/components/GoalInput';
import { TaskDisplay } from '@/components/TaskDisplay';
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserAuth } from "./context/AuthContext";
import { useRouter } from 'next/navigation';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';

const db = getFirestore(firebaseApp);


export default function Home() {
  const [dreams, setDreams] = useState([]);
  const [activeDream, setActiveDream] = useState(null);
  const [progress, setProgress] = useState(0);
  const [view, setView<"dreams" | "tasks">("dreams");
  const { user, logOut } = useUserAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const handleLogOut = async () => {
        try {
            await logOut();
            router.push('/login');
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        if (!user?.uid) {
            console.warn("User ID not set. Ensure user is authenticated.");
            return;
        }

        const dreamsCollection = collection(db, `users/${user.uid}/dreams`);
      const q = query(dreamsCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedDreams = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDreams(fetchedDreams);
        });

        return () => unsubscribe();
    }, [user?.uid]);



  const handleDreamCreation = async (newDream, tasks) => {
    try {
      const dreamsCollection = collection(db, `users/${user?.uid}/dreams`);
      const docRef = await addDoc(dreamsCollection, { ...newDream, tasks: tasks, createdAt: new Date().toISOString() }); // Include tasks in the initial document

      console.log("Dream created with ID: ", docRef.id);

      setActiveDream({ id: docRef.id, ...newDream, tasks: tasks }); // Set tasks to active dream
      setView("tasks");

    } catch (e) {
      console.error("Error adding dream: ", e);
    }

  };

  const handleDreamSelection = (dream) => {
    setActiveDream(dream);
    setView("tasks");
  };

  const handleGoalDecomposition = async (newTasks) => {
        if (!activeDream?.id) {
            console.error("Active dream ID is missing.");
            return;
        }

        try {
            const dreamRef = doc(db, `users/${user?.uid}/dreams`, activeDream.id);
            await updateDoc(dreamRef, { tasks: newTasks });

            // Optimistically update local state
            const updatedDreams = dreams.map(dream =>
                dream.id === activeDream.id ? { ...dream, tasks: newTasks } : dream
            );
            setDreams(updatedDreams);

            setActiveDream(prevActiveDream => ({ ...prevActiveDream, tasks: newTasks }));

            updateProgress(newTasks);
        } catch (error) {
            console.error("Error updating tasks in dream: ", error);
        }
    };

  const handleTaskCompletion = async (taskId) => {
        if (!activeDream?.id) {
            console.error("Active dream ID is missing.");
            return;
        }

        try {
            const dreamRef = doc(db, `users/${user?.uid}/dreams`, activeDream.id);

            // Find the task and toggle its completed status
            const updatedTasks = activeDream.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );

            await updateDoc(dreamRef, { tasks: updatedTasks });

            // Optimistically update local state
            const updatedDreams = dreams.map(dream =>
                dream.id === activeDream.id ? { ...dream, tasks: updatedTasks } : dream
            );
            setDreams(updatedDreams);

            setActiveDream(prevActiveDream => ({ ...prevActiveDream, tasks: updatedTasks }));

            updateProgress(updatedTasks);

        } catch (error) {
            console.error("Error updating task completion status: ", error);
        }
    };

  const updateProgress = (currentTasks) => {
    if (!currentTasks) return;
    const completedTasks = currentTasks.filter((task) => task.completed).length;
    const totalTasks = currentTasks.length;
    const newProgress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
    setProgress(newProgress);
  };

  const renderDreamsView = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Enter a Dream</h2>
        <Button onClick={handleLogOut} variant="secondary">
          Log Out
        </Button>
      </div>
      <GoalInput onGoalDecomposition={handleDreamCreation} isDreamCreation={true} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dreams.map((dream) => (
          <Card key={dream.id} onClick={() => handleDreamSelection(dream)} className="cursor-pointer">
            <CardHeader>
              <CardTitle>{dream.goal}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Created At: {new Date(dream.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTaskOverview = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Button onClick={() => setView("dreams")}>Back to Dreams</Button>
          {activeDream && <h1 className="text-2xl font-bold ml-4">Dream: {activeDream.goal}</h1>}
        </div>
        <div>
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground">Tasks Completed: {progress}%</p>
        </div>
      </div>
      {activeDream && (
        <TaskDisplay
          tasks={activeDream.tasks || []}
          onTaskCompletion={handleTaskCompletion}
          onGoalDecomposition={handleGoalDecomposition}
        />
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {user?.email ? (
        <>
          <div>Currently logged in as: {user.email}</div>
          {view === "dreams" ? renderDreamsView() : renderTaskOverview()}
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
