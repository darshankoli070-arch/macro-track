import { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera, Search, Plus, X, Check, Loader2, Flame, TrendingUp, TrendingDown,
  MessageCircle, User, ChevronLeft, ChevronRight, Trash2, Send, Home,
  Scale, Sparkles, Minus, Pencil, RefreshCw, Bot, Beef, Wheat, Droplet,
  Download, AlertTriangle, Droplets, Dumbbell, Award, Clock, History, LogOut
} from "lucide-react";
import { storageGet, storageSet } from "./lib/storage";
import { supabase } from "./lib/supabaseClient";

/* ---------------------------------------------------------------
   FOOD DATABASE — starter set, weighted toward everyday Indian food
   plus common generic items. Values are typical estimates per the
   listed serving; users can always add their own foods.
------------------------------------------------------------------*/
const FOOD_DB = [
  { name: "Roti / Chapati (whole wheat)", cat: "Grains", serving: "1 piece (40g)", cal: 119, p: 4.4, c: 24, f: 1.5 },
  { name: "Rice, steamed (white)", cat: "Grains", serving: "1 cup (150g)", cal: 195, p: 4, c: 42, f: 0.5 },
  { name: "Rice, brown, cooked", cat: "Grains", serving: "1 cup (150g)", cal: 185, p: 4, c: 39, f: 1.4 },
  { name: "Naan", cat: "Grains", serving: "1 piece (90g)", cal: 262, p: 8.7, c: 45, f: 5 },
  { name: "Paratha, plain", cat: "Grains", serving: "1 piece (60g)", cal: 210, p: 4, c: 27, f: 9 },
  { name: "Aloo paratha", cat: "Grains", serving: "1 piece (100g)", cal: 260, p: 5, c: 35, f: 11 },
  { name: "Poha", cat: "Grains", serving: "1 bowl (150g)", cal: 237, p: 4.5, c: 40, f: 6 },
  { name: "Upma", cat: "Grains", serving: "1 bowl (150g)", cal: 285, p: 6, c: 45, f: 9 },
  { name: "Idli", cat: "Grains", serving: "1 piece (40g)", cal: 58, p: 2, c: 12, f: 0.3 },
  { name: "Dosa, plain", cat: "Grains", serving: "1 piece (80g)", cal: 133, p: 3, c: 21, f: 4 },
  { name: "Masala dosa", cat: "Grains", serving: "1 piece (150g)", cal: 280, p: 6, c: 40, f: 10 },
  { name: "Oats, cooked", cat: "Grains", serving: "1 bowl (150g)", cal: 107, p: 3.8, c: 18, f: 2.3 },
  { name: "Bread, white", cat: "Grains", serving: "1 slice (30g)", cal: 79, p: 2.6, c: 15, f: 1 },
  { name: "Bread, whole wheat", cat: "Grains", serving: "1 slice (30g)", cal: 74, p: 3, c: 13, f: 1 },
  { name: "Dal, toor/arhar", cat: "Dals & Legumes", serving: "1 katori (150g)", cal: 174, p: 10.5, c: 30, f: 0.6 },
  { name: "Dal makhani", cat: "Dals & Legumes", serving: "1 katori (150g)", cal: 225, p: 9, c: 22, f: 12 },
  { name: "Rajma (kidney bean curry)", cat: "Dals & Legumes", serving: "1 katori (150g)", cal: 210, p: 10.5, c: 30, f: 5.3 },
  { name: "Chole (chickpea curry)", cat: "Dals & Legumes", serving: "1 katori (150g)", cal: 246, p: 12, c: 33, f: 7.5 },
  { name: "Sambar", cat: "Dals & Legumes", serving: "1 bowl (150g)", cal: 105, p: 4.5, c: 15, f: 3 },
  { name: "Sprouts (moong), steamed", cat: "Dals & Legumes", serving: "1 bowl (100g)", cal: 30, p: 3, c: 6, f: 0.2 },
  { name: "Paneer, raw", cat: "Dairy", serving: "100g", cal: 265, p: 18, c: 3.4, f: 20 },
  { name: "Paneer butter masala", cat: "Dairy", serving: "1 bowl (150g)", cal: 330, p: 15, c: 12, f: 24 },
  { name: "Palak paneer", cat: "Dairy", serving: "1 bowl (150g)", cal: 225, p: 13.5, c: 9, f: 15 },
  { name: "Curd / yogurt, plain", cat: "Dairy", serving: "1 bowl (100g)", cal: 60, p: 3.5, c: 4.7, f: 3.3 },
  { name: "Raita", cat: "Dairy", serving: "1 bowl (100g)", cal: 70, p: 3, c: 6, f: 3.5 },
  { name: "Milk, whole", cat: "Dairy", serving: "1 cup (240ml)", cal: 150, p: 8, c: 12, f: 8 },
  { name: "Milk, toned/skim", cat: "Dairy", serving: "1 cup (240ml)", cal: 90, p: 8.5, c: 12, f: 0.5 },
  { name: "Ghee", cat: "Dairy", serving: "1 tbsp (14g)", cal: 126, p: 0, c: 0, f: 14 },
  { name: "Cheese slice", cat: "Dairy", serving: "1 slice (20g)", cal: 66, p: 4, c: 0.5, f: 5.4 },
  { name: "Chicken curry", cat: "Non-veg", serving: "1 bowl (150g)", cal: 270, p: 27, c: 7.5, f: 15 },
  { name: "Butter chicken", cat: "Non-veg", serving: "1 bowl (150g)", cal: 360, p: 25.5, c: 10.5, f: 24 },
  { name: "Chicken tikka", cat: "Non-veg", serving: "100g", cal: 195, p: 27, c: 3, f: 8 },
  { name: "Chicken breast, grilled", cat: "Non-veg", serving: "100g", cal: 165, p: 31, c: 0, f: 3.6 },
  { name: "Egg, boiled", cat: "Non-veg", serving: "1 egg (50g)", cal: 78, p: 6.3, c: 0.6, f: 5.3 },
  { name: "Egg curry", cat: "Non-veg", serving: "1 bowl (150g)", cal: 240, p: 13.5, c: 7.5, f: 16.5 },
  { name: "Mutton curry", cat: "Non-veg", serving: "1 bowl (150g)", cal: 375, p: 30, c: 6, f: 25.5 },
  { name: "Fish curry", cat: "Non-veg", serving: "1 bowl (150g)", cal: 225, p: 27, c: 6, f: 10.5 },
  { name: "Salmon, grilled", cat: "Non-veg", serving: "100g", cal: 208, p: 20, c: 0, f: 13 },
  { name: "Biryani, chicken", cat: "Mixed dishes", serving: "1 plate (250g)", cal: 500, p: 22.5, c: 55, f: 20 },
  { name: "Biryani, veg", cat: "Mixed dishes", serving: "1 plate (250g)", cal: 425, p: 10, c: 62.5, f: 15 },
  { name: "Pav bhaji", cat: "Mixed dishes", serving: "1 plate (250g)", cal: 375, p: 7.5, c: 50, f: 17.5 },
  { name: "Bhel puri / chaat", cat: "Mixed dishes", serving: "1 bowl (100g)", cal: 180, p: 4, c: 30, f: 5 },
  { name: "Samosa", cat: "Snacks", serving: "1 piece (60g)", cal: 260, p: 4, c: 24, f: 17 },
  { name: "Pakora, mixed veg", cat: "Snacks", serving: "100g", cal: 280, p: 6, c: 25, f: 18 },
  { name: "Vada, medu", cat: "Snacks", serving: "1 piece (40g)", cal: 97, p: 3, c: 10, f: 5 },
  { name: "Peanuts, roasted", cat: "Snacks", serving: "30g", cal: 170, p: 7, c: 6, f: 14 },
  { name: "Almonds", cat: "Snacks", serving: "10 pieces (12g)", cal: 70, p: 2.6, c: 2.5, f: 6 },
  { name: "Protein shake (whey)", cat: "Snacks", serving: "1 scoop (30g)", cal: 120, p: 24, c: 3, f: 1.5 },
  { name: "Dark chocolate", cat: "Snacks", serving: "20g", cal: 110, p: 1.5, c: 9, f: 8 },
  { name: "Aloo sabzi, dry", cat: "Vegetables", serving: "1 bowl (150g)", cal: 195, p: 3.8, c: 30, f: 7.5 },
  { name: "Bhindi masala", cat: "Vegetables", serving: "1 bowl (150g)", cal: 165, p: 3.8, c: 15, f: 10.5 },
  { name: "Mixed veg curry", cat: "Vegetables", serving: "1 bowl (150g)", cal: 150, p: 4.5, c: 18, f: 7.5 },
  { name: "Baingan bharta", cat: "Vegetables", serving: "1 bowl (150g)", cal: 143, p: 3, c: 15, f: 8 },
  { name: "Potato, boiled", cat: "Vegetables", serving: "100g", cal: 87, p: 1.9, c: 20, f: 0.1 },
  { name: "Sweet potato, boiled", cat: "Vegetables", serving: "100g", cal: 86, p: 1.6, c: 20, f: 0.1 },
  { name: "Spinach, cooked", cat: "Vegetables", serving: "100g", cal: 23, p: 2.9, c: 3.6, f: 0.4 },
  { name: "Salad, mixed veg (no dressing)", cat: "Vegetables", serving: "1 bowl (100g)", cal: 25, p: 1.5, c: 5, f: 0.2 },
  { name: "Cucumber", cat: "Vegetables", serving: "100g", cal: 15, p: 0.7, c: 3.6, f: 0.1 },
  { name: "Tomato", cat: "Vegetables", serving: "100g", cal: 18, p: 0.9, c: 3.9, f: 0.2 },
  { name: "Banana", cat: "Fruits", serving: "1 medium (120g)", cal: 105, p: 1.3, c: 27, f: 0.4 },
  { name: "Apple", cat: "Fruits", serving: "1 medium (180g)", cal: 95, p: 0.5, c: 25, f: 0.3 },
  { name: "Mango", cat: "Fruits", serving: "100g", cal: 60, p: 0.8, c: 15, f: 0.4 },
  { name: "Papaya", cat: "Fruits", serving: "100g", cal: 43, p: 0.5, c: 11, f: 0.3 },
  { name: "Gulab jamun", cat: "Sweets", serving: "1 piece (40g)", cal: 150, p: 2, c: 20, f: 7 },
  { name: "Jalebi", cat: "Sweets", serving: "50g", cal: 190, p: 1.5, c: 30, f: 7.5 },
  { name: "Kheer", cat: "Sweets", serving: "1 bowl (100g)", cal: 130, p: 3, c: 20, f: 4 },
  { name: "Tea with milk & sugar", cat: "Beverages", serving: "1 cup (150ml)", cal: 60, p: 1.5, c: 8, f: 2 },
  { name: "Coffee, black", cat: "Beverages", serving: "1 cup (150ml)", cal: 2, p: 0.3, c: 0, f: 0 },
  { name: "Cooking oil (any)", cat: "Other", serving: "1 tsp (5g)", cal: 45, p: 0, c: 0, f: 5 },
  { name: "Peanut butter", cat: "Other", serving: "1 tbsp (16g)", cal: 95, p: 4, c: 3, f: 8 },
  { name: "Butter", cat: "Other", serving: "1 tbsp (14g)", cal: 102, p: 0.1, c: 0, f: 11.5 },
];

/* ---------------------------------------------------------------
   FAQ DATABASE — the free, no-AI coach. Answers can be plain strings
   or functions of (ctx) for light personalization using the user's
   own plan/totals, without ever calling the API.
------------------------------------------------------------------*/
const FAQ_CATEGORIES = ["Weight Loss", "Weight Gain & Muscle", "Macros & Nutrients", "Meal Timing", "Indian Food Tips", "Exercise", "Hydration & Sleep", "Myths", "Using This App"];

const FAQ_DB = [
  { id: "wl1", category: "Weight Loss", q: "How much of a calorie deficit should I eat in?", keywords: ["deficit", "how much deficit", "calorie deficit size"], a: "A deficit of 300–500 kcal/day is a safe, sustainable range for most people — roughly 0.25–0.5 kg of fat loss per week. Bigger deficits lose weight faster but cost you more muscle and energy, and are harder to sustain." },
  { id: "wl2", category: "Weight Loss", q: "What's my current calorie target?", keywords: ["my calorie target", "how many calories should i eat", "my target"], a: (ctx) => `Your current daily target is ${ctx.plan.calories} kcal, with ${ctx.plan.protein}g protein, ${ctx.plan.carbs}g carbs, and ${ctx.plan.fat}g fat.` },
  { id: "wl3", category: "Weight Loss", q: "Why has my weight loss stalled (plateau)?", keywords: ["plateau", "stalled", "not losing weight", "stuck weight"], a: "Plateaus are normal — your body adapts to a deficit over time (metabolic adaptation), and water retention can mask real fat loss for days or weeks. Before panicking: check you're still logging accurately, give it 2-3 more weeks, and consider a small calorie or activity adjustment rather than a drastic cut." },
  { id: "wl4", category: "Weight Loss", q: "Is it okay to have a cheat day?", keywords: ["cheat day", "cheat meal", "off plan day"], a: "One higher-calorie meal or day occasionally won't undo your progress — weekly average matters far more than any single day. The main risk is if 'cheat day' becomes 'cheat week.' Enjoy it, then get back to your normal pattern the next meal." },
  { id: "wl5", category: "Weight Loss", q: "Does alcohol affect weight loss?", keywords: ["alcohol", "drinking", "beer wine weight loss"], a: "Alcohol is calorie-dense (7 kcal/g) with no nutritional value, and it can lower inhibition around food choices and disrupt sleep — both work against fat loss. Occasional moderate drinking is fine if you account for the calories; regular heavy drinking will noticeably slow progress." },
  { id: "wl6", category: "Weight Loss", q: "Why does the scale go up some days even though I'm eating right?", keywords: ["scale fluctuation", "weight goes up", "daily weight change"], a: "Day-to-day weight swings (1-2 kg) are almost always water — sodium intake, carb intake, hormones, hydration, and even how much food is still in your gut. Look at your weekly trend line, not single days." },
  { id: "wg1", category: "Weight Gain & Muscle", q: "How do I build muscle effectively?", keywords: ["build muscle", "gain muscle", "muscle growth"], a: "Three things drive muscle growth: a modest calorie surplus, enough protein (roughly 1.6-2.2g per kg bodyweight), and progressive resistance training that gets harder over time. Sleep and recovery matter as much as the workout itself." },
  { id: "wg2", category: "Weight Gain & Muscle", q: "How big should my calorie surplus be?", keywords: ["surplus size", "bulking calories", "how much surplus"], a: "A surplus of 200–400 kcal/day is enough to build muscle without gaining excess fat — often called a 'lean bulk.' Bigger surpluses build muscle slightly faster but add noticeably more fat along the way." },
  { id: "wg3", category: "Weight Gain & Muscle", q: "Am I gaining muscle or just fat?", keywords: ["gaining fat not muscle", "muscle vs fat gain"], a: "Rough guide: if you're gaining more than ~0.5kg/week, more of it is likely fat. Strength going up in the gym alongside slow, steady weight gain is a good sign you're building real muscle, not just adding fat." },
  { id: "wg4", category: "Weight Gain & Muscle", q: "What are good high-calorie foods to gain weight?", keywords: ["gain weight foods", "high calorie foods"], a: "Paneer, ghee, nuts, peanut butter, whole milk, dal, rice, and banana are calorie-dense and easy to eat in volume. Favor these over ultra-processed junk — you want the extra calories to build muscle, not just inflammation." },
  { id: "mn1", category: "Macros & Nutrients", q: "How much protein do I need per day?", keywords: ["protein per day", "how much protein", "my protein target"], a: (ctx) => `Your plan targets ${ctx.plan.protein}g/day. As a general rule, 1.6-2.2g per kg of bodyweight covers most goals — higher end while cutting to protect muscle, lower end while maintaining.` },
  { id: "mn2", category: "Macros & Nutrients", q: "Are carbs bad for weight loss?", keywords: ["carbs bad", "should i avoid carbs", "low carb"], a: "No — carbs aren't inherently fattening. Weight change comes down to total calories, not carbs specifically. Carbs fuel workouts and daily energy; the issue is usually eating more total calories than needed, not the carbs themselves." },
  { id: "mn3", category: "Macros & Nutrients", q: "Is ghee healthy?", keywords: ["ghee healthy", "is ghee good"], a: "In moderate amounts, yes — ghee has fat-soluble vitamins and is easier to digest for some people than other fats. It's still calorie-dense (~9 kcal/g) though, so it fits into your fat target rather than being 'free.'" },
  { id: "mn4", category: "Macros & Nutrients", q: "Can eating too much protein be harmful?", keywords: ["too much protein harmful", "protein safe limit"], a: "For most healthy people, high protein intake (even 2-2.5g/kg) is safe. It's mainly a concern for people with existing kidney disease — if that applies to you, check with a doctor. Otherwise, excess protein is just used for energy or repair." },
  { id: "mn5", category: "Macros & Nutrients", q: "Is whey protein safe to use daily?", keywords: ["whey protein safe", "protein shake daily", "protein powder"], a: "Whey protein is just concentrated milk protein — it's safe for daily use for most people and a convenient way to hit protein targets. It's not necessary if you can hit your protein goal from food alone, but it's a fine tool either way." },
  { id: "mn6", category: "Macros & Nutrients", q: "How much of today's protein target have I hit?", keywords: ["how much protein today", "my protein so far"], a: (ctx) => `You're at ${Math.round(ctx.totals.p)}g of your ${ctx.plan.protein}g protein target today — that leaves ${Math.max(0, Math.round(ctx.plan.protein - ctx.totals.p))}g to go.` },
  { id: "mt1", category: "Meal Timing", q: "Does intermittent fasting help with weight loss?", keywords: ["intermittent fasting", "fasting weight loss"], a: "Fasting windows can help some people naturally eat less, but the actual fat loss still comes from being in a calorie deficit — fasting isn't magic on its own. Use it if the eating pattern fits your life, not because it burns extra fat by itself." },
  { id: "mt2", category: "Meal Timing", q: "Is eating late at night bad for weight loss?", keywords: ["eating late night", "late night eating bad"], a: "Total daily calories matter far more than the clock. Eating late isn't inherently fattening — it becomes a problem mainly if late-night eating pushes you over your daily target or is low-quality mindless snacking." },
  { id: "mt3", category: "Meal Timing", q: "How many meals should I eat per day?", keywords: ["how many meals", "meal frequency"], a: "There's no magic number — 2 large meals or 5 small ones can both work equally well for weight loss or gain, as long as total calories and protein land where you want. Pick a pattern that fits your schedule and hunger, since that's what you'll actually stick to." },
  { id: "mt4", category: "Meal Timing", q: "Is breakfast really the most important meal?", keywords: ["breakfast important", "skip breakfast"], a: "Not inherently — skipping breakfast doesn't slow metabolism or sabotage weight loss on its own. Eat it if it helps you manage hunger and hit your targets; skip it if you genuinely prefer fewer, larger meals." },
  { id: "it1", category: "Indian Food Tips", q: "Is rice fattening?", keywords: ["rice fattening", "rice bad for weight loss"], a: "Rice itself isn't fattening — it's a clean carb source. What matters is portion size and what you eat it with (rich gravies, extra ghee). A measured cup of rice fits comfortably into most calorie targets." },
  { id: "it2", category: "Indian Food Tips", q: "Roti or rice — which is better for weight loss?", keywords: ["roti vs rice", "chapati or rice"], a: "Neither is inherently better — gram for gram they're similar in calories. Roti has a bit more fiber which can help fullness; rice is easier to eat in larger volumes. Portion control matters more than which one you pick." },
  { id: "it3", category: "Indian Food Tips", q: "Is dal a good protein source?", keywords: ["dal protein", "is dal good protein"], a: "Dal has decent protein (roughly 7-10g per katori) but it's a partial protein — pairing it with rice or roti (grains) gives a more complete amino acid profile. It's a solid staple, just not as protein-dense as eggs, chicken, or paneer." },
  { id: "it4", category: "Indian Food Tips", q: "What's a good high-protein Indian breakfast?", keywords: ["indian breakfast protein", "high protein breakfast indian"], a: "Options like egg bhurji, moong dal chilla, paneer paratha (in moderation), sprouts, or curd with nuts all pack more protein than typical poha or plain paratha. Adding an egg or a bowl of curd to any breakfast is an easy protein boost." },
  { id: "it5", category: "Indian Food Tips", q: "How do I eat out at Indian restaurants without blowing my calories?", keywords: ["eating out indian food", "restaurant tips indian food"], a: "Go for tandoori/grilled items over deep-fried or heavy-gravy dishes, ask for less oil/butter where possible, favor dal or sabzi over paneer-in-cream dishes, and go easy on naan/rice portions. One rich dish shared, rather than three, keeps things reasonable." },
  { id: "ex1", category: "Exercise", q: "Cardio or weights for fat loss — which is better?", keywords: ["cardio vs weights", "best exercise for fat loss"], a: "Fat loss ultimately comes from the calorie deficit, not the exercise type. Weight training helps preserve muscle while you're in a deficit (so more of what you lose is fat), while cardio burns more calories per session. Ideally, do both." },
  { id: "ex2", category: "Exercise", q: "How many days a week should I work out?", keywords: ["how many workout days", "exercise frequency"], a: "3-5 days a week is a solid range for most goals, with at least 1-2 full rest days. Consistency over months matters far more than squeezing in extra sessions — a sustainable routine beats an intense one you quit after 3 weeks." },
  { id: "ex3", category: "Exercise", q: "Do I need rest days?", keywords: ["rest days necessary", "need rest days"], a: "Yes — muscle actually repairs and grows during rest, not during the workout itself. Training the same muscles hard every day without recovery increases injury risk and can stall progress rather than speed it up." },
  { id: "ex4", category: "Exercise", q: "Is it okay to exercise on an empty stomach?", keywords: ["exercise empty stomach", "fasted workout"], a: "It's generally fine for moderate exercise and some people prefer it, but for high-intensity or longer sessions, a small pre-workout snack (like a banana) can help performance. Neither approach burns meaningfully more fat — it's mostly about how you personally feel." },
  { id: "hs1", category: "Hydration & Sleep", q: "How much water should I drink per day?", keywords: ["how much water", "daily water intake"], a: "Roughly 2-3 liters (8-10 glasses) a day is a common target, more if you're active or it's hot. Thirst and pale-yellow urine are decent everyday indicators that you're hydrated enough." },
  { id: "hs2", category: "Hydration & Sleep", q: "Does drinking more water help with weight loss?", keywords: ["water weight loss", "does water help lose weight"], a: "Water itself has no calories to burn fat, but it can help you feel fuller (especially before meals) and replaces sugary drinks that add unnecessary calories. It's a helpful habit, not a weight-loss mechanism on its own." },
  { id: "hs3", category: "Hydration & Sleep", q: "How does sleep affect weight?", keywords: ["sleep weight", "sleep and fat loss"], a: "Poor sleep raises hunger hormones (ghrelin) and lowers fullness signals (leptin), often leading to more cravings and less willpower the next day. Aiming for 7-8 hours is one of the highest-leverage, most underrated things for weight goals." },
  { id: "hs4", category: "Hydration & Sleep", q: "Does stress affect weight?", keywords: ["stress weight gain", "cortisol weight"], a: "Chronic stress raises cortisol, which can increase appetite and cravings for high-calorie comfort food, and disrupts sleep too — a double hit. Managing stress isn't just about feeling better, it genuinely supports your goals." },
  { id: "my1", category: "Myths", q: "Can I spot-reduce fat from a specific area (like belly fat)?", keywords: ["spot reduction", "belly fat exercise", "lose fat from stomach"], a: "No — this is one of the most persistent fitness myths. Doing crunches doesn't preferentially burn belly fat; your body loses fat from all over based on genetics, and you can't choose the order. A calorie deficit reduces fat overall, including eventually there." },
  { id: "my2", category: "Myths", q: "Do detox teas or juice cleanses actually work?", keywords: ["detox tea", "juice cleanse", "detox diet"], a: "No real evidence supports them for fat loss — any quick weight drop is mostly water and gut contents, not fat, and it returns once you eat normally again. Your liver and kidneys already handle detoxification; no tea speeds that up." },
  { id: "my3", category: "Myths", q: "Do carbs after 6pm turn into fat?", keywords: ["carbs after 6pm", "carbs at night fat"], a: "No — your body doesn't have a clock that suddenly turns carbs into fat at a certain hour. Total daily calories and carbs matter, not what time you eat them." },
  { id: "my4", category: "Myths", q: "Does eating fat make you fat?", keywords: ["eating fat makes you fat", "dietary fat weight gain"], a: "No — dietary fat and body fat aren't the same thing. Weight gain happens from eating more total calories than you burn, regardless of whether those calories come from fat, carbs, or protein. Fat is just more calorie-dense per gram (9 vs 4), so portions matter." },
  { id: "ua1", category: "Using This App", q: "How does the photo scan estimate calories?", keywords: ["how photo scan works", "how does scanning work"], a: "Photo scanning requires an image-recognition service. This version does not send photos to an external AI service, so use Search or Manual entry to add food." },
  { id: "ua2", category: "Using This App", q: "How was my calorie/macro plan calculated?", keywords: ["how plan calculated", "how was my plan made"], a: "Your plan comes from the one-time intake conversation and a built-in local calculation using your body stats and the information you provide. You can also edit the numbers directly anytime from the Profile tab." },
  { id: "ua3", category: "Using This App", q: "How do I change my calorie or macro target?", keywords: ["change my target", "edit my plan", "update calories"], a: "Two ways: type a direct request here like \"set protein to 150\" or \"decrease calories by 200\" and it applies instantly with no AI needed, or go to Profile → Edit for full manual control over every number." },
  { id: "ua4", category: "Using This App", q: "Why does this coach say it can't answer something?", keywords: ["why no answer", "coach cant answer"], a: "This Coach uses built-in answers and local app logic, so very specific questions may not match anything. Browse the topics above or rephrase your question." },
];

function faqSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const qWords = q.split(/\s+/).filter((w) => w.length > 2);
  const scored = FAQ_DB.map((f) => {
    const hay = (f.q + " " + f.keywords.join(" ")).toLowerCase();
    let score = 0;
    if (hay.includes(q)) score += 5;
    qWords.forEach((w) => { if (hay.includes(w)) score += 1; });
    return { f, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map((x) => x.f);
}

function parsePlanCommand(text, plan, sex) {
  const lower = text.toLowerCase();
  const numMatch = lower.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return null;
  const num = parseFloat(numMatch[1]);
  let field = null;
  if (/protein/.test(lower)) field = "protein";
  else if (/carb/.test(lower)) field = "carbs";
  else if (/\bfat\b/.test(lower)) field = "fat";
  else if (/calor|kcal|target/.test(lower)) field = "calories";
  if (!field) return null;

  let action = null;
  if (/\bincrease|raise|add|more|up by|bump\b/.test(lower)) action = "increase";
  else if (/\bdecrease|lower|reduce|cut|drop|less|down by\b/.test(lower)) action = "decrease";
  else if (/\bset|make it|change to|to \d/.test(lower)) action = "set";
  if (!action) return null;

  const before = plan[field];
  let after = before;
  if (action === "set") after = num;
  else if (action === "increase") after = before + num;
  else if (action === "decrease") after = Math.max(0, before - num);

  const nextPlan = { ...plan, [field]: Math.round(after) };
  const clamped = clampPlan(nextPlan, sex);
  return { field, before, after: clamped[field], plan: clamped, floorHit: field === "calories" && clamped.calories !== Math.round(after) };
}
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);
const round = (n) => Math.round(n * 10) / 10;
const safeMinCal = (sex) => (sex === "male" ? 1500 : 1200);
function computeStreak(dailyTotals) {
  let streak = 0;
  let d = new Date();
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    const entry = dailyTotals[key];
    if (entry && entry.cal > 0) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  return streak;
}

function clampPlan(plan, sex) {
  const min = safeMinCal(sex);
  let calories = Math.round(plan.calories || 0);
  let clamped = false;
  if (!calories || calories < min) { calories = min; clamped = true; }
  if (calories > 6000) { calories = 6000; clamped = true; }
  let protein = Math.round(plan.protein || 0);
  let carbs = Math.round(plan.carbs || 0);
  let fat = Math.round(plan.fat || 0);
  if (!protein || protein < 20 || protein > 400) protein = Math.round((calories * 0.3) / 4);
  if (!fat || fat < 15 || fat > 250) fat = Math.round((calories * 0.25) / 9);
  if (!carbs || carbs < 20) carbs = Math.round(Math.max(0, calories - protein * 4 - fat * 9) / 4);
  return {
    calories, protein, carbs, fat,
    mealsPerDay: plan.mealsPerDay || 3,
    paceKgPerWeek: plan.paceKgPerWeek ?? 0,
    rationale: plan.rationale || "",
    clamped,
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function callClaude({ system, messages }) {
  // Local coach engine: no Anthropic API, no API key, no Netlify AI function.
  // This keeps the existing App.jsx flow working entirely in the browser.

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content || "";

  const extractBasics = () => {
    const match = system.match(/You already know:\s*(\{[\s\S]*?\})\s*\(/);
    if (!match) return {};
    try { return JSON.parse(match[1]); } catch { return {}; }
  };

  const basics = extractBasics();

  // -------------------------------------------------------------
  // Intake: ask one question at a time, then build a local plan.
  // -------------------------------------------------------------
  if (system.includes("one-time intake conversation")) {
    const userAnswers = messages
      .filter((m) => m.role === "user" && !m.hidden)
      .map((m) => typeof m.content === "string" ? m.content : "")
      .filter(Boolean);

    const questions = [
      "What is your main goal right now — lose fat, gain muscle or weight, maintain your weight, or improve overall fitness?",
      "How active are you during a normal day — mostly sitting, fairly active, or very active?",
      "How often do you work out, and what type of training do you usually do?",
      "What does a normal day of eating look like for you — meals, snacks, and drinks?",
      "What foods do you like, dislike, avoid, or cannot eat? Any allergies or intolerances?",
      "Are there any medical conditions or medications that could affect your diet or metabolism?",
      "Have you tried changing your diet or weight before? What worked or did not work for you?",
      "How are your sleep, stress, motivation, and timeline for reaching your goal?"
    ];

    const forceBuild = /build my plan|estimate my plan|just estimate/i.test(lastUserMessage);

    if (userAnswers.length < questions.length && !forceBuild) {
      return questions[userAnswers.length];
    }

    const age = Number(basics.age) || 25;
    const height = Number(basics.heightCm) || 170;
    const weight = Number(basics.weightKg) || 70;
    const sex = basics.sex || "male";

    const bmr = sex === "female"
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;

    const combined = userAnswers.join(" ").toLowerCase();
    let activityMultiplier = 1.45;
    if (/very active|physical work|highly active/.test(combined)) activityMultiplier = 1.70;
    else if (/gym|workout|training|exercise|active/.test(combined)) activityMultiplier = 1.55;

    let calories = Math.round(bmr * activityMultiplier);
    let goal = "maintenance";
    let pace = 0;

    if (/lose fat|lose weight|fat loss|cut|weight loss/.test(combined)) {
      goal = "fat loss";
      calories -= 200;
      pace = -0.2;
    } else if (/gain muscle|gain weight|muscle|bulk/.test(combined)) {
      goal = "muscle building";
      calories += 200;
      pace = 0.2;
    } else if (/recomposition|recomp/.test(combined)) {
      goal = "body recomposition";
      pace = 0;
    }

    calories = Math.max(safeMinCal(sex), Math.min(6000, calories));
    const protein = Math.round(weight * 1.6);
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.max(20, Math.round((calories - protein * 4 - fat * 9) / 4));

    const plan = {
      calories,
      protein,
      carbs,
      fat,
      mealsPerDay: 3,
      paceKgPerWeek: pace,
      rationale: `This is a starting estimate based on your body measurements and the activity and goal information you provided. The targets are intentionally moderate and can be reviewed as you log meals and progress.`
    };

    const profile = {
      goal,
      activity: userAnswers[1] || "not discussed",
      eatingPattern: userAnswers[3] || "not discussed",
      foodNotes: userAnswers[4] || "not discussed",
      medical: userAnswers[5] || "not discussed",
      pastAttempts: userAnswers[6] || "not discussed",
      sleepStress: userAnswers[7] || "not discussed",
      motivation: userAnswers[7] || "not discussed"
    };

    return `Thanks — I have enough information to create your starting plan. I've used your measurements, activity and the answers you gave during the intake. You can review and edit the numbers before starting to track.\n<PLAN>${JSON.stringify(plan)}</PLAN>\n<PROFILE>${JSON.stringify(profile)}</PROFILE>`;
  }

  // -------------------------------------------------------------
  // Progress check: keep the existing feature but do it locally.
  // -------------------------------------------------------------
  if (system.includes("reviewing whether to adjust")) {
    const match = system.match(/Current plan:\s*(\{[\s\S]*?\})\.\s*Basics:/);
    let currentPlan = null;
    try { if (match) currentPlan = JSON.parse(match[1]); } catch {}

    return JSON.stringify({
      adjust: false,
      calories: currentPlan?.calories || 0,
      protein: currentPlan?.protein || 0,
      carbs: currentPlan?.carbs || 0,
      fat: currentPlan?.fat || 0,
      reason: "No automatic change was made. Keep logging consistently so the app has enough progress data for a future review."
    });
  }

  // -------------------------------------------------------------
  // Photo scanner: image understanding requires an AI service.
  // Do not pretend that a photo was analyzed without one.
  // -------------------------------------------------------------
  if (system.includes("identify food items in a photo")) {
    return JSON.stringify({ items: [] });
  }

  // -------------------------------------------------------------
  // Local Coach answers.
  // -------------------------------------------------------------
  const q = String(lastUserMessage).toLowerCase();

  if (q.includes("protein")) {
    return "Check the Protein progress bar on your dashboard to see today's logged protein and your target. You can also type a command such as 'set protein to 120' to change the target.";
  }
  if (q.includes("calorie")) {
    return "Your calorie target is shown on the dashboard. You can change it directly by typing a command such as 'set calories to 2200'.";
  }
  if (q.includes("water")) {
    return "Use the Water tracker on the dashboard to record your water intake throughout the day.";
  }
  if (q.includes("workout") || q.includes("exercise")) {
    return "Use the Exercise section on the dashboard to record your workouts and estimated calories burned.";
  }
  if (q.includes("meal") || q.includes("food")) {
    return "Use Log food to search the food database, add a custom food, or choose a recent food. You can adjust the serving size before saving it.";
  }
  if (q.includes("sleep")) {
    return "Consistent sleep is useful for recovery and general wellbeing. Try to keep a regular sleep schedule where possible.";
  }
  if (/\b(hi|hello|hey)\b/.test(q)) {
    return "Hey! I'm your NutriTrack coach. Ask me about your meals, protein, calories, water, exercise, or your current plan.";
  }

  return "I'm your NutriTrack coach. I can help with your logged meals, protein, calories, water, exercise and current plan. You can also browse the topics above for quick answers.";
}

/* ---------------------------------------------------------------
   App
------------------------------------------------------------------*/
export default function App() {
  const [ready, setReady] = useState(false);
  const [ackWarning, setAckWarning] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [basics, setBasics] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planHistory, setPlanHistory] = useState([]);
  const [intakeMsgs, setIntakeMsgs] = useState([]);
  const [intakeProfile, setIntakeProfile] = useState(null);
  const [editingBasics, setEditingBasics] = useState(false);
  const [redoIntake, setRedoIntake] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [meals, setMeals] = useState([]);
  const [weightLog, setWeightLog] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chat, setChat] = useState([]);
  const [banner, setBanner] = useState(null);
  const [checkingAdjust, setCheckingAdjust] = useState(false);
  const [limitModal, setLimitModal] = useState(false);
  const [theme, setTheme] = useState("light");
  const [fasting, setFasting] = useState({ startTime: null, targetHours: 16 });
  const [measurements, setMeasurements] = useState([]);
  const [notes, setNotes] = useState("");
  const [water, setWater] = useState(0);
  const [exercise, setExercise] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({});
  const [recentFoods, setRecentFoods] = useState([]);

  useEffect(() => {
    (async () => {
      const b = await storageGet("basics", null);
      const p = await storageGet("plan", null);
      const ph = await storageGet("plan-history", []);
      const im = await storageGet("intake-messages", []);
      const ip = await storageGet("intake-profile", null);
      const m = await storageGet(`meals:${todayStr()}`, []);
      const w = await storageGet("weight-log", []);
      const cf = await storageGet("custom-foods", []);
      const ch = await storageGet("chat-history", []);
      const bn = await storageGet("banner", null);
      const wt = await storageGet(`water:${todayStr()}`, 0);
      const ex = await storageGet(`exercise:${todayStr()}`, []);
      const dt = await storageGet("daily-totals", {});
      const rf = await storageGet("recent-foods", []);
      const th = await storageGet("theme", "light");
      const fa = await storageGet("fasting", { startTime: null, targetHours: 16 });
      const ms = await storageGet("measurements-log", []);
      const nt = await storageGet(`notes:${todayStr()}`, "");
      const ack = await storageGet("account-warning-ack", false);
      setBasics(b); setPlan(p); setPlanHistory(ph); setIntakeMsgs(im); setIntakeProfile(ip);
      setMeals(m); setWeightLog(w); setCustomFoods(cf); setChat(ch); setBanner(bn);
      setWater(wt); setExercise(ex); setDailyTotals(dt); setRecentFoods(rf); setTheme(th);
      setFasting(fa); setMeasurements(ms); setNotes(nt); setAckWarning(ack);
      setReady(true);
    })();
  }, []);

  const saveBasics = (v) => { setBasics(v); storageSet("basics", v); };
  const savePlan = (v) => { setPlan(v); storageSet("plan", v); };
  const savePlanHistory = (v) => { setPlanHistory(v); storageSet("plan-history", v); };
  const saveIntakeMsgs = (v) => { setIntakeMsgs(v); storageSet("intake-messages", v); };
  const saveIntakeProfile = (v) => { setIntakeProfile(v); storageSet("intake-profile", v); };
  const saveMealsForDate = useCallback((date, next) => {
    storageSet(`meals:${date}`, next);
    const t = next.reduce((a, m) => ({ cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }), { cal: 0, p: 0, c: 0, f: 0 });
    setDailyTotals((prev) => {
      const nd = { ...prev, [date]: t };
      storageSet("daily-totals", nd);
      return nd;
    });
    if (date === todayStr()) setMeals(next);
  }, []);
  const saveMeals = useCallback((next) => saveMealsForDate(todayStr(), next), [saveMealsForDate]);
  const saveWater = useCallback((n) => { setWater(n); storageSet(`water:${todayStr()}`, n); }, []);
  const saveExercise = useCallback((next) => { setExercise(next); storageSet(`exercise:${todayStr()}`, next); }, []);
  const saveRecentFoods = useCallback((next) => { setRecentFoods(next); storageSet("recent-foods", next.slice(0, 20)); }, []);
  const saveWeightLog = useCallback((next) => { setWeightLog(next); storageSet("weight-log", next); }, []);
  const saveCustomFoods = useCallback((next) => { setCustomFoods(next); storageSet("custom-foods", next); }, []);
  const saveChat = useCallback((next) => { setChat(next); storageSet("chat-history", next.slice(-30)); }, []);
  const saveBanner = (v) => { setBanner(v); storageSet("banner", v); };
  const saveTheme = (v) => { setTheme(v); storageSet("theme", v); };
  const saveFasting = (v) => { setFasting(v); storageSet("fasting", v); };
  const saveMeasurements = (v) => { setMeasurements(v); storageSet("measurements-log", v); };
  const saveNotes = (v) => { setNotes(v); storageSet(`notes:${todayStr()}`, v); };
  const saveAckWarning = () => { setAckWarning(true); storageSet("account-warning-ack", true); };

  const checkAdjustment = useCallback(async (newWeightLog) => {
    if (!plan || !basics) return;
    const sorted = newWeightLog.slice().sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) {
      saveBanner({ text: "Log at least two weight entries first so there's a trend to check.", ts: Date.now() });
      return;
    }
    const span = (new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / 86400000;
    if (span < 4) {
      saveBanner({ text: "Give it a few more days between entries before checking — need at least 4 days spread.", ts: Date.now() });
      return;
    }

    setCheckingAdjust(true);
    try {
      const system = `You are a nutrition coach reviewing whether to adjust this user's daily calorie/macro target based on real progress. Current plan: ${JSON.stringify(plan)}. Basics: ${JSON.stringify(basics)}. What you know about them from intake: ${JSON.stringify(intakeProfile)}. Recent weight log (date, kg): ${JSON.stringify(sorted.slice(-14))}. Their intended pace was ${plan.paceKgPerWeek} kg/week. Decide if a modest adjustment is warranted (usually under 150 kcal change). Never go below ${safeMinCal(basics.sex)} kcal/day. Respond with ONLY JSON, no markdown: {"adjust":boolean,"calories":number,"protein":number,"carbs":number,"fat":number,"reason":string (one short sentence, plain and specific)}`;
      const text = await callClaude({ system, messages: [{ role: "user", content: "Review my progress and decide on any adjustment." }] });
      const clean = text.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);
      if (result.adjust) {
        const next = clampPlan(result, basics.sex);
        savePlan(next);
        savePlanHistory([...planHistory, { date: todayStr(), ...next, reason: result.reason }]);
        saveBanner({ text: `Target updated: ${plan.calories} → ${next.calories} kcal. ${result.reason}`, ts: Date.now() });
      } else {
        saveBanner({ text: `Coach checked your trend — no change needed. ${result.reason || "You're on track."}`, ts: Date.now() });
      }
    } catch (e) {
      if (e.isLimit) { setLimitModal(true); } else {
        saveBanner({ text: `Couldn't complete the check: ${e.message || "try again later."}`, ts: Date.now() });
      }
    } finally {
      setCheckingAdjust(false);
    }
  }, [plan, basics, planHistory, intakeProfile]);

  if (!ready) {
    return <div className="nt-root nt-center"><StyleBlock /><Loader2 className="nt-spin" size={28} /></div>;
  }

  if (!ackWarning) {
    return (
      <div className="nt-root">
        <StyleBlock />
        <WelcomeScreen onAck={saveAckWarning} />
      </div>
    );
  }

  if (!basics || editingBasics) {
    return (
      <div className={`nt-root ${theme && theme !== "light" ? theme : ""}`}>
        <StyleBlock />
        <BasicsForm
          initial={basics}
          onSave={(b) => { saveBasics(b); setEditingBasics(false); }}
          onCancel={basics ? () => setEditingBasics(false) : null}
        />
      </div>
    );
  }

  if (!plan || redoIntake) {
    return (
      <div className={`nt-root ${theme && theme !== "light" ? theme : ""}`}>
        <StyleBlock />
        <IntakeChat
          basics={basics}
          initialMsgs={redoIntake ? [] : intakeMsgs}
          onProgress={saveIntakeMsgs}
          onLimitReached={() => setLimitModal(true)}
          onComplete={(p, profile, rawText) => {
            const clamped = clampPlan(p, basics.sex);
            savePlan(clamped);
            savePlanHistory([...(redoIntake ? planHistory : []), { date: todayStr(), ...clamped, reason: "Initial plan from intake" }]);
            if (profile) saveIntakeProfile(profile);
            setRedoIntake(false);
            saveIntakeMsgs([]);
          }}
        />
        {limitModal && <LimitModal onClose={() => setLimitModal(false)} />}
      </div>
    );
  }

  const totals = meals.reduce((a, m) => ({ cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }), { cal: 0, p: 0, c: 0, f: 0 });

  return (
    <div className={`nt-root ${theme && theme !== "light" ? theme : ""}`}>
      <StyleBlock />
      <div className="nt-shell">
        {banner && (
          <div className="nt-banner">
            <RefreshCw size={14} />
            <span>{banner.text}</span>
            <button onClick={() => saveBanner(null)}><X size={13} /></button>
          </div>
        )}
        <div className="nt-content">
          {tab === "dashboard" && (
            <Dashboard
              basics={basics} plan={plan} totals={totals} meals={meals}
              water={water} onWater={saveWater}
              exercise={exercise} onAddExercise={(item) => saveExercise([...exercise, item])} onDeleteExercise={(id) => saveExercise(exercise.filter((x) => x.id !== id))}
              streak={computeStreak(dailyTotals)} daysLogged={Object.keys(dailyTotals).length}
              fasting={fasting} onFasting={saveFasting}
              notes={notes} onNotes={saveNotes}
              onDeleteMeal={(id) => saveMeals(meals.filter((m) => m.id !== id))}
              onAdd={() => setShowAdd(true)}
              onOpenHistory={() => setShowHistory(true)}
              onEditBasics={() => setEditingBasics(true)}
              onAskCoach={() => setTab("assistant")}
            />
          )}
          {tab === "weight" && (
            <WeightTab
              basics={basics} plan={plan} weightLog={weightLog} checking={checkingAdjust} dailyTotals={dailyTotals}
              measurements={measurements}
              onAddMeasurement={(m) => saveMeasurements([...measurements.filter((x) => x.date !== todayStr()), { date: todayStr(), ...m }].sort((a, b) => a.date.localeCompare(b.date)))}
              onDeleteMeasurement={(date) => saveMeasurements(measurements.filter((x) => x.date !== date))}
              onAddWeight={(kg) => {
                const next = [...weightLog.filter((w) => w.date !== todayStr()), { date: todayStr(), kg }].sort((a, b) => a.date.localeCompare(b.date));
                saveWeightLog(next);
              }}
              onCheckAdjustment={() => checkAdjustment(weightLog)}
              onDeleteWeight={(date) => saveWeightLog(weightLog.filter((w) => w.date !== date))}
            />
          )}
          {tab === "assistant" && (
            <AssistantTab
              chat={chat} setChat={saveChat}
              context={{ basics, plan, intakeProfile, totals, weightLog: weightLog.slice(-14) }}
              onLimitReached={() => setLimitModal(true)}
              onUpdatePlan={(newPlan, reason) => {
                const clamped = clampPlan(newPlan, basics.sex);
                savePlan(clamped);
                savePlanHistory([...planHistory, { date: todayStr(), ...clamped, reason: reason || "Changed via coach chat" }]);
                saveBanner({ text: `Target updated: ${plan.calories} → ${clamped.calories} kcal. ${reason || ""}`, ts: Date.now() });
              }}
            />
          )}
          {tab === "profile" && (
            <ProfileSummary
              basics={basics} plan={plan} planHistory={planHistory} intakeProfile={intakeProfile}
              theme={theme} onSetTheme={saveTheme}
              onEditBasics={() => setEditingBasics(true)}
              onRedoIntake={() => setRedoIntake(true)}
              onSavePlan={(p) => {
                const clamped = clampPlan(p, basics.sex);
                savePlan(clamped);
                savePlanHistory([...planHistory, { date: todayStr(), ...clamped, reason: "Manually adjusted by you" }]);
              }}
            />
          )}
        </div>

        <nav className="nt-nav">
          <NavBtn icon={Home} label="Today" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <NavBtn icon={Bot} label="Coach" active={tab === "assistant"} onClick={() => setTab("assistant")} />
          <NavBtn icon={Scale} label="Weight" active={tab === "weight"} onClick={() => setTab("weight")} />
          <NavBtn icon={User} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        </nav>
      </div>

      {showAdd && (
        <AddFoodModal
          basics={basics} customFoods={customFoods} recentFoods={recentFoods}
          onSaveCustomFood={(f) => saveCustomFoods([...customFoods, f])}
          onClose={() => setShowAdd(false)}
          onLimitReached={() => setLimitModal(true)}
          onAddMeals={(items) => {
            saveMeals([...meals, ...items]);
            const additions = items.map((it) => ({ name: it.name.replace(/\s*\([\d.]+x\)$/, ""), cal: it.cal, p: it.p, c: it.c, f: it.f }));
            const merged = [...additions, ...recentFoods.filter((r) => !additions.some((a) => a.name === r.name))].slice(0, 20);
            saveRecentFoods(merged);
            setShowAdd(false);
          }}
        />
      )}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} onSaveMealsForDate={saveMealsForDate} />}
      {limitModal && <LimitModal onClose={() => setLimitModal(false)} />}
    </div>
  );
}

function LimitModal({ onClose }) {
  return (
    <div className="nt-modal-backdrop" onClick={onClose}>
      <div className="nt-limit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nt-limit-icon"><AlertTriangle size={22} /></div>
        <h2>External AI is not enabled</h2>
        <p>This version of NutriTrack uses the built-in local Coach and does not require an Anthropic API key.</p>
        <p className="nt-limit-sub">Food logging, water, exercise, weight tracking, intake setup, and Coach Q&A continue to work without an external AI service.</p>
        <button className="nt-btn primary full" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

function HistoryModal({ onClose, onSaveMealsForDate }) {
  const [date, setDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [meals, setMealsLocal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setMealsLocal(null);
    storageGet(`meals:${date}`, []).then((m) => { if (!cancelled) setMealsLocal(m); });
    return () => { cancelled = true; };
  }, [date]);

  const shiftDate = (days) => {
    const d = new Date(date); d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };
  const deleteItem = (id) => {
    const next = meals.filter((m) => m.id !== id);
    setMealsLocal(next);
    onSaveMealsForDate(date, next);
  };

  const isToday = date === todayStr();
  const totals = (meals || []).reduce((a, m) => ({ cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }), { cal: 0, p: 0, c: 0, f: 0 });

  return (
    <div className="nt-modal-backdrop" onClick={onClose}>
      <div className="nt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nt-modal-head">
          <div className="nt-history-nav">
            <button className="nt-iconbtn" onClick={() => shiftDate(-1)}><ChevronLeft size={16} /></button>
            <span className="nt-history-date">{new Date(date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{isToday ? " (Today)" : ""}</span>
            <button className="nt-iconbtn" disabled={isToday} onClick={() => shiftDate(1)}><ChevronRight size={16} /></button>
          </div>
          <button className="nt-iconbtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="nt-modal-body">
          {meals === null ? (
            <div className="nt-center" style={{ minHeight: 120 }}><Loader2 className="nt-spin" size={20} /></div>
          ) : (
            <>
              <div className="nt-card">
                <Row label="Total that day" value={`${Math.round(totals.cal)} kcal · P${round(totals.p)} C${round(totals.c)} F${round(totals.f)}`} highlight />
              </div>
              {meals.length === 0 && <p className="nt-empty">Nothing logged this day.</p>}
              <div className="nt-meal-list">
                {meals.map((m) => (
                  <div className="nt-meal-item" key={m.id}>
                    <div>
                      <div className="nt-meal-name">{m.name}</div>
                      <div className="nt-meal-macros">{Math.round(m.cal)} kcal · P{round(m.p)} C{round(m.c)} F{round(m.f)}{m.type ? ` · ${MEAL_TYPE_LABEL[m.type] || m.type}` : ""}</div>
                    </div>
                    <button className="nt-iconbtn subtle" onClick={() => deleteItem(m.id)}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button className={`nt-navbtn ${active ? "active" : ""}`} onClick={onClick}>
      <span className="nt-navbtn-icon"><Icon size={19} strokeWidth={active ? 2.3 : 1.8} /></span>
      <span>{label}</span>
    </button>
  );
}

/* ---------------------------------------------------------------
   Quick basics form — biometrics only, everything else is the AI's job
------------------------------------------------------------------*/
function WelcomeScreen({ onAck }) {
  return (
    <div className="nt-form-wrap">
      <div className="nt-warning-badge"><Sparkles size={22} /></div>
      <h1 className="nt-warning-title">Welcome — quickly, how this app works</h1>
      <div className="nt-warning-list">
        <div className="nt-warning-item">
          <strong>Your data lives in your own private cloud database.</strong>
          <p>Everything you log — meals, weight, your plan, chat history — is saved to your account, protected so only you can read or write it. It follows you across any device where you log in.</p>
        </div>
        <div className="nt-warning-item">
          <strong>AI features use this site's own API billing.</strong>
          <p>Your plan and Coach intake run locally in this app without an external AI API or API key. Your account data continues to use your private Supabase database.</p>
        </div>
        <div className="nt-warning-item">
          <strong>You can take your data with you.</strong>
          <p>Profile → "Download my data as JSON" exports everything, any time, independent of this app.</p>
        </div>
      </div>
      <button className="nt-btn primary full" onClick={onAck}>Got it — let's go</button>
    </div>
  );
}

function BasicsForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { name: "", sex: "male", age: 25, heightCm: 170, weightKg: 70, goalWeightKg: "", worksOut: false, workoutTime: "18:00" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.age > 0 && f.heightCm > 0 && f.weightKg > 0;

  return (
    <div className="nt-form-wrap">
      <div className="nt-form-header">
        <Sparkles size={22} />
        <div>
          <h1>{initial ? "Update your basics" : "First, the basics"}</h1>
          <p>Just body stats here — your coach will ask about the rest in a moment and build your actual plan from that conversation.</p>
        </div>
      </div>
      <div className="nt-form-grid">
        <label className="nt-field"><span>Name (optional)</span><input value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label className="nt-field"><span>Sex</span>
          <select value={f.sex} onChange={(e) => set("sex", e.target.value)}>
            <option value="male">Male</option><option value="female">Female</option>
          </select>
        </label>
        <label className="nt-field"><span>Age</span><input type="number" value={f.age} onChange={(e) => set("age", Number(e.target.value))} /></label>
        <label className="nt-field"><span>Height (cm)</span><input type="number" value={f.heightCm} onChange={(e) => set("heightCm", Number(e.target.value))} /></label>
        <label className="nt-field"><span>Current weight (kg)</span><input type="number" step="0.1" value={f.weightKg} onChange={(e) => set("weightKg", Number(e.target.value))} /></label>
        <label className="nt-field"><span>Goal weight (kg, optional)</span><input type="number" step="0.1" value={f.goalWeightKg} onChange={(e) => set("goalWeightKg", e.target.value)} /></label>
      </div>

      <label className="nt-field" style={{ marginTop: 14 }}><span>Do you work out / go to the gym?</span>
        <div className="nt-theme-row">
          <button type="button" className={`nt-theme-btn ${f.worksOut ? "active" : ""}`} onClick={() => set("worksOut", true)}>Yes</button>
          <button type="button" className={`nt-theme-btn ${!f.worksOut ? "active" : ""}`} onClick={() => set("worksOut", false)}>No</button>
        </div>
      </label>
      {f.worksOut && (
        <label className="nt-field" style={{ marginTop: 12 }}><span>What time do you usually work out?</span>
          <input type="time" value={f.workoutTime} onChange={(e) => set("workoutTime", e.target.value)} />
        </label>
      )}

      <div className="nt-form-actions">
        {onCancel && <button className="nt-btn ghost" onClick={onCancel}>Cancel</button>}
        <button className="nt-btn primary" disabled={!valid} onClick={() => onSave(f)}>Continue to coach chat</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   AI Intake Chat — asks the deep questions, builds the plan
------------------------------------------------------------------*/
const INTAKE_OPENER = "Begin the intake conversation now with your first question.";

function IntakeChat({ basics, initialMsgs, onProgress, onComplete, onLimitReached }) {
  const [msgs, setMsgs] = useState(initialMsgs && initialMsgs.length ? initialMsgs : [{ role: "user", content: INTAKE_OPENER, hidden: true }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const endRef = useRef(null);
  const started = useRef(false);

  const system = `You are an experienced nutrition and fitness coach conducting a one-time intake conversation to build this person's calorie and macro plan. You already know: ${JSON.stringify(basics)} (non-vegetarian, eats everything, no dietary restriction stated). Ask exactly ONE short, conversational question at a time — never a list of questions. Topics to cover across the conversation, roughly in this order but adapt naturally: (1) their goal — lose fat, gain muscle/weight, maintain, or recomposition, and how urgently/what pace feels reasonable to them; (2) activity level — job/daily activity plus structured exercise type and frequency; (3) typical eating pattern — meals and snacks per day, how much they cook at home vs eat out, time/budget constraints; (4) food preferences and dislikes, and any allergies or intolerances; (5) relevant medical conditions that affect diet or metabolism, e.g. thyroid, PCOS, diabetes — note you are not a doctor and they should consult one for medical concerns, but you still want the info for the plan; (6) past attempts at diet/weight change — what worked, what didn't, why they stopped; (7) sleep quality and stress levels; (8) motivation and timeline. Once you have enough to build a genuinely personalized plan (usually after 8-11 questions, fewer if answers are rich), STOP asking questions. Instead reply with a short 2-4 sentence plain-language summary of the plan and reasoning, then on new lines output ONLY these two exact blocks with no markdown fences, nothing else after them: <PLAN>{"calories":number,"protein":number,"carbs":number,"fat":number,"mealsPerDay":number,"paceKgPerWeek":number (negative for fat loss, positive for gain, 0 for maintain),"rationale":"2-4 sentences explaining the reasoning referencing specifics they told you"}</PLAN> <PROFILE>{"goal":"short phrase","activity":"short description of job + exercise","eatingPattern":"meals/snacks, home vs eating out, time/budget","foodNotes":"likes, dislikes, allergies","medical":"relevant conditions or none stated","pastAttempts":"what they tried before and what happened","sleepStress":"sleep quality and stress level","motivation":"why now / timeline"}</PROFILE>. Every field in PROFILE should be filled with what they actually told you, in their own terms, kept short — use "not discussed" only if a topic genuinely never came up. Compute calories using Mifflin-St Jeor BMR from the basics times an activity multiplier you judge from their answers, then adjust for their goal pace using ~7700 kcal per kg of body weight per week. Never plan below ${safeMinCal(basics.sex)} kcal/day for this person. Keep every question and the final summary warm, brief, and free of jargon.`;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (initialMsgs && initialMsgs.length > 1) return; // already in progress, wait for user
    runTurn(msgs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runTurn = async (history) => {
    setLoading(true);
    try {
      const text = await callClaude({ system, messages: history.map((m) => ({ role: m.role, content: m.content })) });
      const planMatch = text.match(/<PLAN>([\s\S]*?)<\/PLAN>/);
      const profileMatch = text.match(/<PROFILE>([\s\S]*?)<\/PROFILE>/);
      if (planMatch) {
        const cutIdx = Math.min(planMatch.index, profileMatch ? profileMatch.index : planMatch.index);
        const before = text.slice(0, cutIdx).trim();
        const next = [...history, { role: "assistant", content: before }];
        setMsgs(next); onProgress(next);
        let parsedPlan = null, parsedProfile = null;
        try { parsedPlan = JSON.parse(planMatch[1]); } catch {}
        if (profileMatch) { try { parsedProfile = JSON.parse(profileMatch[1]); } catch {} }
        setSummary({ text: before, plan: parsedPlan, profile: parsedProfile });
      } else {
        const next = [...history, { role: "assistant", content: text }];
        setMsgs(next); onProgress(next);
      }
    } catch (e) {
      if (e.isLimit) {
        onLimitReached();
      } else {
        const next = [...history, { role: "assistant", content: `⚠️ ${e.message || "Something went wrong — could you try answering again?"}` }];
        setMsgs(next); onProgress(next);
      }
    } finally {
      setLoading(false);
    }
  };

  const send = (forcedText) => {
    const val = forcedText || input.trim();
    if (!val || loading) return;
    const next = [...msgs, { role: "user", content: val }];
    setMsgs(next); onProgress(next); setInput("");
    runTurn(next);
  };

  if (summary) {
    return (
      <div className="nt-form-wrap">
        <div className="nt-form-header">
          <Sparkles size={22} />
          <div><h1>Your plan is ready</h1><p>{summary.text}</p></div>
        </div>
        {summary.plan ? (
          <EditablePlan
            plan={summary.plan}
            onConfirm={(finalPlan) => onComplete(finalPlan, summary.profile, summary.text)}
          />
        ) : (
          <p className="nt-note error">Couldn't parse a structured plan — try again.</p>
        )}
      </div>
    );
  }

  return (
    <div className="nt-page nt-chat-page nt-intake-page">
      <div className="nt-page-head"><h1>Getting to know you</h1></div>
      <div className="nt-chat-scroll">
        {msgs.filter((m) => !m.hidden).map((m, i) => (
          <div key={i} className={`nt-bubble ${m.role}`}>{m.content}</div>
        ))}
        {loading && <div className="nt-bubble assistant"><Loader2 className="nt-spin" size={16} /></div>}
        <div ref={endRef} />
      </div>
      <div className="nt-chat-input">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your answer…" disabled={loading}
        />
        <button className="nt-iconbtn primary" onClick={() => send()} disabled={loading}><Send size={16} /></button>
      </div>
      {msgs.filter((m) => !m.hidden).length >= 6 && (
        <button className="nt-btn ghost full" onClick={() => send("Please build my plan now with your best estimate from what we've covered so far.")} disabled={loading}>
          Skip ahead — just estimate my plan
        </button>
      )}
    </div>
  );
}

function EditablePlan({ plan, onConfirm, confirmLabel, sex }) {
  const [p, setP] = useState({
    calories: Math.round(plan.calories || 0),
    protein: Math.round(plan.protein || 0),
    carbs: Math.round(plan.carbs || 0),
    fat: Math.round(plan.fat || 0),
    mealsPerDay: plan.mealsPerDay || 3,
  });
  const set = (k, v) => setP((prev) => ({ ...prev, [k]: Number(v) }));
  const min = sex ? safeMinCal(sex) : 1000;
  const belowFloor = sex && p.calories < min;

  return (
    <div>
      <div className="nt-card">
        <label className="nt-editrow"><span>Calories</span><input type="number" value={p.calories} onChange={(e) => set("calories", e.target.value)} /><span className="nt-editunit">kcal</span></label>
        <label className="nt-editrow"><span>Protein</span><input type="number" value={p.protein} onChange={(e) => set("protein", e.target.value)} /><span className="nt-editunit">g</span></label>
        <label className="nt-editrow"><span>Carbs</span><input type="number" value={p.carbs} onChange={(e) => set("carbs", e.target.value)} /><span className="nt-editunit">g</span></label>
        <label className="nt-editrow"><span>Fat</span><input type="number" value={p.fat} onChange={(e) => set("fat", e.target.value)} /><span className="nt-editunit">g</span></label>
        <label className="nt-editrow"><span>Meals/day</span><input type="number" value={p.mealsPerDay} onChange={(e) => set("mealsPerDay", e.target.value)} /><span className="nt-editunit"></span></label>
      </div>
      {belowFloor && <p className="nt-note error">That's below a commonly-used safe minimum ({min} kcal) for your stats — you can still save it, but consider checking with a doctor first.</p>}
      <button className="nt-btn primary full" onClick={() => onConfirm({ ...p, paceKgPerWeek: plan.paceKgPerWeek ?? 0, rationale: plan.rationale || "Manually customized by you." })}>
        {confirmLabel || "Start tracking"}
      </button>
    </div>
  );
}


function ProfileSummary({ basics, plan, planHistory, intakeProfile, theme, onSetTheme, onEditBasics, onRedoIntake, onSavePlan }) {
  const [exporting, setExporting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const bmi = basics.heightCm ? basics.weightKg / ((basics.heightCm / 100) ** 2) : null;
  const bmiLabel = bmi == null ? "—" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obese range";
  const exportData = async () => {
    setExporting(true);
    try {
      const keys = ["basics", "plan", "plan-history", "intake-messages", "intake-profile", "weight-log", "custom-foods", "chat-history", `meals:${todayStr()}`];
      const out = {};
      for (const k of keys) out[k] = await storageGet(k, null);
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "nutritrack-data.json"; a.click();
      URL.revokeObjectURL(url);
    } finally { setExporting(false); }
  };

  const PROFILE_LABELS = {
    goal: "Goal", activity: "Activity", eatingPattern: "Eating pattern", foodNotes: "Food preferences",
    medical: "Medical notes", pastAttempts: "Past attempts", sleepStress: "Sleep & stress", motivation: "Motivation",
  };

  return (
    <div className="nt-page">
      <div className="nt-page-head"><h1>Profile</h1><button className="nt-iconbtn" onClick={onEditBasics}><Pencil size={16} /></button></div>

      <div className="nt-card data-card">
        <div className="nt-data-head"><Sparkles size={15} /><span>Where your data lives</span></div>
        <p className="nt-note">Everything — meals, weight, your plan, chat with your coach — is saved in your own private cloud database, protected by row-level security so only your logged-in account can ever read or write it. It follows you across any device where you log in.</p>
        <button className="nt-btn ghost full" onClick={exportData} disabled={exporting}>
          {exporting ? <Loader2 className="nt-spin" size={14} /> : <Download size={14} />} Download my data as JSON
        </button>
        <button className="nt-btn ghost full" onClick={() => supabase.auth.signOut()} style={{ marginTop: 8 }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="nt-card">
        <Row label="Name" value={basics.name || "—"} />
        <Row label="Sex" value={basics.sex === "male" ? "Male" : "Female"} />
        <Row label="Age" value={`${basics.age} yrs`} />
        <Row label="Height" value={`${basics.heightCm} cm`} />
        <Row label="Weight" value={`${basics.weightKg} kg`} />
        {basics.goalWeightKg && <Row label="Goal weight" value={`${basics.goalWeightKg} kg`} />}
        {bmi != null && <Row label="BMI" value={`${bmi.toFixed(1)} · ${bmiLabel}`} />}
      </div>

      <div className="nt-card">
        <div className="nt-data-head"><Sparkles size={15} /><span>Appearance</span></div>
        <div className="nt-theme-grid">
          <button className={`nt-theme-btn ${theme === "light" ? "active" : ""}`} onClick={() => onSetTheme("light")}>☀️ Light</button>
          <button className={`nt-theme-btn ${theme === "dark" ? "active" : ""}`} onClick={() => onSetTheme("dark")}>🌙 Dark</button>
          <button className={`nt-theme-btn ${theme === "ocean" ? "active" : ""}`} onClick={() => onSetTheme("ocean")}>🌊 Ocean</button>
          <button className={`nt-theme-btn ${theme === "forest" ? "active" : ""}`} onClick={() => onSetTheme("forest")}>🌿 Forest</button>
        </div>
      </div>

      {intakeProfile && (
        <>
          <h2 className="nt-subhead">What your coach knows about you</h2>
          <div className="nt-card">
            {Object.entries(PROFILE_LABELS).map(([key, label]) => intakeProfile[key] ? <Row key={key} label={label} value={intakeProfile[key]} /> : null)}
          </div>
          <p className="nt-note">This is what came out of your intake conversation, and it's what your coach uses every time you chat or when your plan gets adjusted — not just numbers.</p>
        </>
      )}

      <div className="nt-subhead-row">
        <h2 className="nt-subhead">Your current plan</h2>
        <button className="nt-textbtn" onClick={() => setEditingPlan((v) => !v)}>{editingPlan ? "Cancel" : "Edit"}</button>
      </div>
      {editingPlan ? (
        <EditablePlan
          plan={plan} sex={basics.sex} confirmLabel="Save changes"
          onConfirm={(p) => { onSavePlan(p); setEditingPlan(false); }}
        />
      ) : (
        <div className="nt-card">
          <Row label="Calories" value={`${plan.calories} kcal`} highlight />
          <Row label="Protein" value={`${plan.protein} g`} />
          <Row label="Carbs" value={`${plan.carbs} g`} />
          <Row label="Fat" value={`${plan.fat} g`} />
          <Row label="Pace" value={`${plan.paceKgPerWeek > 0 ? "+" : ""}${plan.paceKgPerWeek} kg/week`} />
        </div>
      )}
      {!editingPlan && plan.rationale && <p className="nt-note">{plan.rationale}</p>}
      {!editingPlan && plan.clamped && <p className="nt-note">This was adjusted up to a safer minimum calorie floor.</p>}

      {planHistory.length > 1 && (
        <>
          <h2 className="nt-subhead">Adjustment history</h2>
          <div className="nt-meal-list">
            {planHistory.slice().reverse().map((h, i) => (
              <div className="nt-meal-item" key={i}>
                <div>
                  <div className="nt-meal-name">{h.calories} kcal</div>
                  <div className="nt-meal-macros">{new Date(h.date).toLocaleDateString()} · {h.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <button className="nt-btn ghost full" onClick={onRedoIntake} style={{ marginTop: 16 }}>Redo the deep-dive questions</button>
      <button className="nt-btn primary full" onClick={onEditBasics}>Edit body stats</button>
    </div>
  );
}
function Row({ label, value, highlight }) {
  return <div className="nt-row"><span>{label}</span><strong className={highlight ? "hl" : ""}>{value}</strong></div>;
}

/* ---------------------------------------------------------------
   Dashboard
------------------------------------------------------------------*/
const MEAL_TYPE_LABEL = { breakfast: "Breakfast", lunch: "Lunch", preworkout: "Pre-workout", postworkout: "Post-workout", dinner: "Dinner", snack: "Snacks" };
const MEAL_TYPE_ORDER = ["breakfast", "lunch", "preworkout", "postworkout", "dinner", "snack"];
const WATER_TARGET = 8;

function computeAchievements({ streak, daysLogged, totals, plan, water }) {
  return [
    { id: "first", label: "First Log", icon: Check, unlocked: daysLogged >= 1 },
    { id: "s3", label: "3-Day Streak", icon: Flame, unlocked: streak >= 3 },
    { id: "s7", label: "7-Day Streak", icon: Flame, unlocked: streak >= 7 },
    { id: "s30", label: "30-Day Streak", icon: Award, unlocked: streak >= 30 },
    { id: "protein", label: "Protein Goal", icon: Beef, unlocked: totals.p >= plan.protein },
    { id: "hydrated", label: "Hydrated", icon: Droplets, unlocked: water >= WATER_TARGET },
    { id: "consistent", label: "Consistent (7d)", icon: TrendingUp, unlocked: daysLogged >= 7 },
  ];
}

function suggestMeals(remainingCal, remainingProtein) {
  if (remainingCal < 60) return [];
  return FOOD_DB
    .filter((f) => f.cal <= remainingCal + 60 && f.cal >= Math.min(60, remainingCal * 0.25))
    .map((f) => ({ ...f, fit: Math.abs(f.cal - remainingCal * 0.4) - (remainingProtein > 0 ? f.p * 2 : 0) }))
    .sort((a, b) => a.fit - b.fit)
    .slice(0, 3);
}

function Dashboard({ basics, plan, totals, meals, water, onWater, exercise, onAddExercise, onDeleteExercise, streak, daysLogged, fasting, onFasting, notes, onNotes, onDeleteMeal, onAdd, onOpenHistory, onEditBasics, onAskCoach }) {
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const burned = exercise.reduce((a, x) => a + x.cal, 0);
  const budget = plan.calories + burned;
  const pct = Math.min(100, Math.round((totals.cal / budget) * 100));
  const remaining = Math.max(0, budget - Math.round(totals.cal));
  const remainingProtein = Math.max(0, plan.protein - totals.p);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  const grouped = MEAL_TYPE_ORDER.map((t) => ({ type: t, items: meals.filter((m) => (m.type || "snack") === t) })).filter((g) => g.items.length);
  const achievements = computeAchievements({ streak, daysLogged, totals, plan, water });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const suggestions = suggestMeals(remaining, remainingProtein);

  return (
    <div className="nt-page">
      <div className="nt-dash-header">
        <div className="nt-page-head">
          <div><p className="nt-eyebrow">{dateLabel}</p><h1>Hi{basics.name ? `, ${basics.name}` : ""}</h1></div>
          <div className="nt-header-actions">
            {streak > 0 && <span className="nt-streak-badge"><Flame size={13} /> {streak}</span>}
            <button className="nt-iconbtn" onClick={onEditBasics}><User size={18} /></button>
          </div>
        </div>

        <div className="nt-hero">
          <div className="nt-ring" style={{ "--pct": pct }}>
            <div className="nt-ring-inner">
              <Flame size={18} className="nt-flame" />
              <div className="nt-ring-num">{Math.round(totals.cal)}</div>
              <div className="nt-ring-sub">of {budget} kcal</div>
            </div>
          </div>
          <div className="nt-hero-side">
            <div className="nt-remain">{remaining} kcal left today{burned > 0 ? ` (+${burned} from exercise)` : ""}</div>
            <MacroBar label="Protein" cls="prot" val={totals.p} goal={plan.protein} />
            <MacroBar label="Carbs" cls="carb" val={totals.c} goal={plan.carbs} />
            <MacroBar label="Fat" cls="fat" val={totals.f} goal={plan.fat} />
          </div>
        </div>
      </div>

      <button className="nt-badge-strip" onClick={() => setShowBadges((v) => !v)}>
        {achievements.filter((a) => a.unlocked).slice(0, 5).map((a) => {
          const Icon = a.icon;
          return <span key={a.id} className="nt-badge-chip"><Icon size={12} /></span>;
        })}
        <span className="nt-badge-count">{unlockedCount}/{achievements.length} milestones</span>
      </button>
      {showBadges && (
        <div className="nt-card">
          <div className="nt-achievement-grid">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className={`nt-achievement ${a.unlocked ? "unlocked" : ""}`}>
                  <div className="nt-achievement-icon"><Icon size={16} /></div>
                  <span>{a.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="nt-quickrow">
        <button className="nt-add-btn" onClick={onAdd}><span className="nt-chip-icon"><Plus size={16} /></span> Log food</button>
        <button className="nt-add-btn ghost" onClick={onAskCoach}><span className="nt-chip-icon alt"><Bot size={16} /></span> Ask coach</button>
      </div>

      <div className="nt-tracker-row">
        <div className="nt-tracker-card">
          <div className="nt-tracker-top"><span className="nt-tracker-icon water"><Droplets size={14} /></span><span>Water</span></div>
          <div className="nt-water-row">
            {Array.from({ length: WATER_TARGET }).map((_, i) => (
              <button key={i} className={`nt-water-drop ${i < water ? "filled" : ""}`} onClick={() => onWater(i < water ? i : i + 1)} />
            ))}
          </div>
          <div className="nt-tracker-sub">{water}/{WATER_TARGET} glasses</div>
        </div>
        <div className="nt-tracker-card">
          <div className="nt-tracker-top"><span className="nt-tracker-icon ex"><Dumbbell size={14} /></span><span>Exercise</span></div>
          <div className="nt-tracker-sub big">{burned} kcal burned</div>
          <button className="nt-tracker-add" onClick={() => setShowExerciseForm(true)}><Plus size={12} /> Log workout</button>
        </div>
      </div>

      {exercise.length > 0 && (
        <div className="nt-meal-list" style={{ marginTop: 10 }}>
          {exercise.map((x) => (
            <div className="nt-meal-item" key={x.id}>
              <div><div className="nt-meal-name">{x.name}</div><div className="nt-meal-macros">{x.cal} kcal burned</div></div>
              <button className="nt-iconbtn subtle" onClick={() => onDeleteExercise(x.id)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      <FastingCard fasting={fasting} onFasting={onFasting} />

      {showExerciseForm && <ExerciseForm onClose={() => setShowExerciseForm(false)} onSave={(x) => { onAddExercise(x); setShowExerciseForm(false); }} />}

      <div className="nt-subhead-row">
        <h2 className="nt-subhead">Today's meals</h2>
        <button className="nt-textbtn" onClick={onOpenHistory}><History size={13} style={{ marginRight: 4, verticalAlign: "-2px" }} />Past days</button>
      </div>
      {meals.length === 0 && (
        <div className="nt-empty-block">
          <div className="nt-empty-icon"><Camera size={20} /></div>
          <p className="nt-empty">Nothing logged yet — tap "Log food" to scan a photo or search a dish.</p>
        </div>
      )}
      {grouped.map((g) => (
        <div key={g.type} className="nt-meal-group">
          <div className="nt-meal-group-label">{MEAL_TYPE_LABEL[g.type]}</div>
          <div className="nt-meal-list">
            {g.items.slice().reverse().map((m) => (
              <div className="nt-meal-item" key={m.id}>
                <div>
                  <div className="nt-meal-name">{m.name}</div>
                  <div className="nt-meal-macros">{Math.round(m.cal)} kcal · P{round(m.p)} C{round(m.c)} F{round(m.f)}</div>
                </div>
                <button className="nt-iconbtn subtle" onClick={() => onDeleteMeal(m.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {suggestions.length > 0 && (
        <>
          <h2 className="nt-subhead">Fits your remaining macros</h2>
          <div className="nt-food-results">
            {suggestions.map((f) => (
              <div key={f.name} className="nt-food-row" style={{ cursor: "default" }}>
                <div><div className="nt-food-name">{f.name}</div><div className="nt-food-meta">{f.serving} · {f.cal} kcal · P{f.p}g</div></div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="nt-subhead">Today's notes</h2>
      <textarea
        className="nt-notes-area"
        placeholder="How's today going? Cravings, energy, anything worth remembering…"
        value={notes}
        onChange={(e) => onNotes(e.target.value)}
      />
    </div>
  );
}

function FastingCard({ fasting, onFasting }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!fasting.startTime) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [fasting.startTime]);

  const elapsedMs = fasting.startTime ? Date.now() - new Date(fasting.startTime).getTime() : 0;
  const elapsedH = elapsedMs / 3600000;
  const pct = fasting.startTime ? Math.min(100, (elapsedH / fasting.targetHours) * 100) : 0;
  const hh = Math.floor(elapsedH);
  const mm = Math.floor((elapsedH - hh) * 60);

  return (
    <div className="nt-card" style={{ marginTop: 10 }}>
      <div className="nt-tracker-top"><span className="nt-tracker-icon fast"><Clock size={14} /></span><span>Fasting</span></div>
      {fasting.startTime ? (
        <>
          <div className="nt-fast-time">{hh}h {mm}m <span className="nt-fast-target">/ {fasting.targetHours}h target</span></div>
          <div className="nt-macrobar-track" style={{ margin: "8px 0" }}><div className="nt-macrobar-fill fast" style={{ width: `${pct}%` }} /></div>
          <button className="nt-btn ghost full" onClick={() => onFasting({ startTime: null, targetHours: fasting.targetHours })}>End fast</button>
        </>
      ) : (
        <>
          <div className="nt-fast-options">
            {[14, 16, 18].map((h) => (
              <button key={h} className={`nt-mealtype-pill ${fasting.targetHours === h ? "active" : ""}`} onClick={() => onFasting({ ...fasting, targetHours: h })}>{h}h</button>
            ))}
          </div>
          <button className="nt-btn primary full" onClick={() => onFasting({ startTime: new Date().toISOString(), targetHours: fasting.targetHours })}>Start fast</button>
        </>
      )}
    </div>
  );
}

function ExerciseForm({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  return (
    <div className="nt-card" style={{ marginTop: 10 }}>
      <label className="nt-field" style={{ marginBottom: 8 }}><span>Activity</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gym, run, cycling" /></label>
      <label className="nt-field"><span>Calories burned (estimate)</span><input type="number" value={cal} onChange={(e) => setCal(e.target.value)} /></label>
      <div className="nt-form-actions" style={{ marginTop: 12 }}>
        <button className="nt-btn ghost" onClick={onClose}>Cancel</button>
        <button className="nt-btn primary" disabled={!name || !cal} onClick={() => onSave({ id: uid(), name, cal: Number(cal) })}>Save</button>
      </div>
    </div>
  );
}

const MACRO_ICON = { prot: Beef, carb: Wheat, fat: Droplet };
function MacroBar({ label, cls, val, goal }) {
  const pct = Math.min(100, Math.round((val / goal) * 100));
  const Icon = MACRO_ICON[cls];
  return (
    <div className="nt-macrobar">
      <div className="nt-macrobar-top">
        <span className="nt-macrobar-label"><span className={`nt-macro-badge ${cls}`}><Icon size={11} /></span>{label}</span>
        <span>{round(val)}/{goal}g</span>
      </div>
      <div className="nt-macrobar-track"><div className={`nt-macrobar-fill ${cls}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Weight tab
------------------------------------------------------------------*/
function WeightTab({ basics, plan, weightLog, onAddWeight, onDeleteWeight, checking, dailyTotals, onCheckAdjustment, measurements, onAddMeasurement, onDeleteMeasurement }) {
  const [val, setVal] = useState(basics.weightKg);
  const [showMeasureForm, setShowMeasureForm] = useState(false);
  const sorted = weightLog.slice().sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const first = sorted[0];
  let weeklyRate = null;
  if (sorted.length >= 2) {
    const days = (new Date(last.date) - new Date(first.date)) / 86400000;
    if (days > 0) weeklyRate = ((last.kg - first.kg) / days) * 7;
  }

  let etaText = null;
  if (last && basics.goalWeightKg && weeklyRate) {
    const remaining = last.kg - Number(basics.goalWeightKg);
    const movingRightWay = (remaining > 0 && weeklyRate < 0) || (remaining < 0 && weeklyRate > 0);
    if (movingRightWay && Math.abs(weeklyRate) > 0.02) {
      const weeksLeft = Math.abs(remaining / weeklyRate);
      const etaDate = new Date();
      etaDate.setDate(etaDate.getDate() + Math.round(weeksLeft * 7));
      etaText = `At this trend, ~${Math.round(weeksLeft)} week${Math.round(weeksLeft) !== 1 ? "s" : ""} to reach ${basics.goalWeightKg}kg — around ${etaDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}.`;
    }
  }

  const w = 320, h = 120;
  const points = sorted.slice(-30);
  const minKg = points.length ? Math.min(...points.map((p) => p.kg)) - 0.5 : 0;
  const maxKg = points.length ? Math.max(...points.map((p) => p.kg)) + 0.5 : 1;
  const path = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * w : w / 2;
    const y = h - ((p.kg - minKg) / (maxKg - minKg || 1)) * h;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString(undefined, { weekday: "short" })[0], cal: (dailyTotals && dailyTotals[key]?.cal) || 0 };
  });
  const maxDay = Math.max(plan.calories, ...last7.map((d) => d.cal), 1);
  const sortedMeasurements = (measurements || []).slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="nt-page">
      <div className="nt-page-head"><h1>Progress</h1></div>
      <div className="nt-card">
        <div className="nt-weight-input">
          <input type="number" step="0.1" value={val} onChange={(e) => setVal(Number(e.target.value))} />
          <span>kg</span>
          <button className="nt-btn primary" onClick={() => onAddWeight(val)}>Log today</button>
        </div>
      </div>
      {points.length > 1 && (
        <div className="nt-card"><svg viewBox={`0 0 ${w} ${h}`} className="nt-chart"><path d={path} fill="none" stroke="var(--nt-accent)" strokeWidth="2.5" /></svg></div>
      )}
      <div className="nt-card">
        <Row label="Current" value={last ? `${last.kg} kg` : "—"} />
        {basics.goalWeightKg && <Row label="Goal" value={`${basics.goalWeightKg} kg`} />}
        <Row label="Weekly trend" value={weeklyRate !== null ? `${weeklyRate > 0 ? "+" : ""}${round(weeklyRate)} kg/wk` : "—"} />
        <Row label="Planned pace" value={`${plan.paceKgPerWeek > 0 ? "+" : ""}${plan.paceKgPerWeek} kg/wk`} />
      </div>
      {etaText && <p className="nt-note nt-eta">{etaText}</p>}
      <button className="nt-btn ghost full" onClick={onCheckAdjustment} disabled={checking}>
        {checking ? <><Loader2 className="nt-spin" size={14} /> Checking your trend…</> : <><RefreshCw size={14} /> Ask coach to review my target</>}
      </button>
      <p className="nt-note">This check runs locally in the app — no external AI API or API key is required.</p>

      <h2 className="nt-subhead">Calories this week</h2>
      <div className="nt-card">
        <div className="nt-bar-chart">
          {last7.map((d, i) => (
            <div key={i} className="nt-bar-col">
              <div className="nt-bar-track"><div className="nt-bar-fill" style={{ height: `${Math.min(100, (d.cal / maxDay) * 100)}%` }} /></div>
              <span className="nt-bar-label">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nt-subhead-row">
        <h2 className="nt-subhead">Body measurements</h2>
        <button className="nt-textbtn" onClick={() => setShowMeasureForm((v) => !v)}>{showMeasureForm ? "Cancel" : "+ Log"}</button>
      </div>
      {showMeasureForm && <MeasurementForm onSave={(m) => { onAddMeasurement(m); setShowMeasureForm(false); }} />}
      {sortedMeasurements.length === 0 && !showMeasureForm && <p className="nt-empty">No measurements logged yet — waist, chest, hips, arms.</p>}
      <div className="nt-meal-list">
        {sortedMeasurements.map((m) => (
          <div className="nt-meal-item" key={m.date}>
            <div>
              <div className="nt-meal-name">{new Date(m.date).toLocaleDateString()}</div>
              <div className="nt-meal-macros">{[m.waist && `Waist ${m.waist}cm`, m.chest && `Chest ${m.chest}cm`, m.hips && `Hips ${m.hips}cm`, m.arms && `Arms ${m.arms}cm`].filter(Boolean).join(" · ")}</div>
            </div>
            <button className="nt-iconbtn subtle" onClick={() => onDeleteMeasurement(m.date)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      <h2 className="nt-subhead">History</h2>
      <div className="nt-meal-list">
        {sorted.slice().reverse().map((w2) => (
          <div className="nt-meal-item" key={w2.date}>
            <div><div className="nt-meal-name">{w2.kg} kg</div><div className="nt-meal-macros">{new Date(w2.date).toLocaleDateString()}</div></div>
            <button className="nt-iconbtn subtle" onClick={() => onDeleteWeight(w2.date)}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasurementForm({ onSave }) {
  const [m, setM] = useState({ waist: "", chest: "", hips: "", arms: "" });
  const set = (k, v) => setM((p) => ({ ...p, [k]: v }));
  const hasAny = m.waist || m.chest || m.hips || m.arms;
  return (
    <div className="nt-card">
      <div className="nt-form-grid two">
        <label className="nt-field"><span>Waist (cm)</span><input type="number" value={m.waist} onChange={(e) => set("waist", e.target.value)} /></label>
        <label className="nt-field"><span>Chest (cm)</span><input type="number" value={m.chest} onChange={(e) => set("chest", e.target.value)} /></label>
        <label className="nt-field"><span>Hips (cm)</span><input type="number" value={m.hips} onChange={(e) => set("hips", e.target.value)} /></label>
        <label className="nt-field"><span>Arms (cm)</span><input type="number" value={m.arms} onChange={(e) => set("arms", e.target.value)} /></label>
      </div>
      <button className="nt-btn primary full" disabled={!hasAny} onClick={() => onSave({
        waist: m.waist ? Number(m.waist) : null, chest: m.chest ? Number(m.chest) : null,
        hips: m.hips ? Number(m.hips) : null, arms: m.arms ? Number(m.arms) : null,
      })}>Save measurements</button>
    </div>
  );
}

/* ---------------------------------------------------------------
   Assistant / Coach tab
------------------------------------------------------------------*/
function AssistantTab({ chat, setChat, context, onUpdatePlan, onLimitReached }) {
  const [input, setInput] = useState("");
  const [browseCat, setBrowseCat] = useState(null);
  const [asking, setAsking] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, asking]);

  const answerText = (f) => (typeof f.a === "function" ? f.a(context) : f.a);
  const pushPair = (question, answerMsg) => setChat([...chat, { id: uid(), role: "user", content: question }, answerMsg]);

  const handleFaq = (f) => { pushPair(f.q, { id: uid(), role: "assistant", content: answerText(f) }); setInput(""); setBrowseCat(null); };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const cmd = context.plan && context.basics ? parsePlanCommand(text, context.plan, context.basics.sex) : null;
    if (cmd) {
      onUpdatePlan(cmd.plan, `Changed via coach (typed command): "${text}"`);
      const label = { calories: "Calories", protein: "Protein", carbs: "Carbs", fat: "Fat" }[cmd.field];
      const unit = cmd.field === "calories" ? "kcal" : "g";
      let msg = `Done — ${label} changed from ${Math.round(cmd.before)}${unit} to ${Math.round(cmd.after)}${unit}. No AI used.`;
      if (cmd.floorHit) msg += " (Kept at a safe minimum calorie floor.)";
      pushPair(text, { id: uid(), role: "assistant", content: msg });
      return;
    }

    const results = faqSearch(text);
    if (results.length > 0) {
      pushPair(text, { id: uid(), role: "assistant", content: answerText(results[0]), canAskAI: true, originalQuery: text });
    } else {
      pushPair(text, { id: uid(), role: "assistant", content: "I don't have a canned answer for that — try browsing topics below or rephrase it.", canAskAI: true, originalQuery: text });
    }
  };

  const askRealAI = async (query) => {
    setAsking(true);
    try {
      const system = `You are a nutrition and fitness coach inside a tracking app. Answer concisely (a few sentences), warm and practical, grounded in this user's data (JSON): ${JSON.stringify(context)}. Never suggest extreme restriction; suggest a doctor for medical concerns.`;
      const reply = await callClaude({ system, messages: [{ role: "user", content: query }] });
      setChat([...chat, { id: uid(), role: "assistant", content: reply, aiPowered: true }]);
    } catch (e) {
      if (e.isLimit) { onLimitReached(); } else {
        setChat([...chat, { id: uid(), role: "assistant", content: `⚠️ ${e.message || "Couldn't reach the AI — try again."}` }]);
      }
    } finally { setAsking(false); }
  };

  const liveResults = input.trim() ? faqSearch(input).slice(0, 4) : [];

  return (
    <div className="nt-page nt-chat-page">
      <div className="nt-page-head"><h1>Coach</h1></div>

      <div className="nt-search-box"><Search size={16} /><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask a question, or type a change like 'set protein to 150'…" /></div>
      {liveResults.length > 0 && (
        <div className="nt-food-results" style={{ marginBottom: 10 }}>
          {liveResults.map((f) => (
            <button key={f.id} className="nt-food-row" onClick={() => handleFaq(f)}>
              <div className="nt-food-name">{f.q}</div><ChevronRight size={16} />
            </button>
          ))}
        </div>
      )}

      <div className="nt-cat-row">
        {FAQ_CATEGORIES.map((c) => (
          <button key={c} className={`nt-cat-pill ${browseCat === c ? "active" : ""}`} onClick={() => setBrowseCat(browseCat === c ? null : c)}>{c}</button>
        ))}
      </div>
      {browseCat && (
        <div className="nt-food-results" style={{ margin: "10px 0" }}>
          {FAQ_DB.filter((f) => f.category === browseCat).map((f) => (
            <button key={f.id} className="nt-food-row" onClick={() => handleFaq(f)}>
              <div className="nt-food-name">{f.q}</div><ChevronRight size={16} />
            </button>
          ))}
        </div>
      )}

      <div className="nt-chat-scroll">
        {chat.length === 0 && (
          <div className="nt-empty-block">
            <div className="nt-empty-icon alt"><Bot size={20} /></div>
            <p className="nt-empty">Search a question or browse topics above — answers here cost nothing. Type a direct change like "set protein to 150" to update your plan instantly, also free.</p>
          </div>
        )}
        {chat.map((m, i) => (
          <div key={m.id || i} className={`nt-bubble ${m.role}`}>
            {m.content}
            {m.aiPowered && <span className="nt-ai-tag">Coach</span>}
            {m.canAskAI && <button className="nt-asktextbtn" disabled={asking} onClick={() => askRealAI(m.originalQuery)}>Ask coach →</button>}
          </div>
        ))}
        {asking && <div className="nt-bubble assistant"><Loader2 className="nt-spin" size={16} /></div>}
        <div ref={endRef} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Add Food Modal (scan / search / manual)
------------------------------------------------------------------*/
function getMealTypeOptions(basics) {
  const opts = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
  ];
  if (basics && basics.worksOut) {
    opts.push({ key: "preworkout", label: "Pre-workout" }, { key: "postworkout", label: "Post-workout" });
  }
  opts.push({ key: "dinner", label: "Dinner" }, { key: "snack", label: "Snack" });
  return opts;
}

function guessMealType(basics) {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;

  if (basics && basics.worksOut && basics.workoutTime) {
    const [wh, wm] = basics.workoutTime.split(":").map(Number);
    const workoutH = wh + (wm || 0) / 60;
    const diff = h - workoutH; // negative = before workout, positive = after
    if (diff >= -2 && diff < 0) return "preworkout";
    if (diff >= 0 && diff <= 2) return "postworkout";
  }
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 21) return "dinner";
  return "snack";
}

function AddFoodModal({ basics, customFoods, recentFoods, onSaveCustomFood, onClose, onAddMeals, onLimitReached }) {
  const [mode, setMode] = useState("search");
  const [mealType, setMealType] = useState(() => guessMealType(basics));
  const stamp = (items) => onAddMeals(items.map((it) => ({ ...it, type: mealType })));
  const mealTypeOptions = getMealTypeOptions(basics);
  const suggested = guessMealType(basics);

  return (
    <div className="nt-modal-backdrop" onClick={onClose}>
      <div className="nt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nt-modal-head">
          <div className="nt-tabs-inline">
            <button className={mode === "search" ? "active" : ""} onClick={() => setMode("search")}>Search</button>
            <button className={mode === "scan" ? "active" : ""} onClick={() => setMode("scan")}>Scan photo</button>
            <button className={mode === "custom" ? "active" : ""} onClick={() => setMode("custom")}>Custom</button>
          </div>
          <button className="nt-iconbtn" onClick={onClose}><X size={18} /></button>
        </div>
        {(suggested === "preworkout" || suggested === "postworkout") && mealType === suggested && (
          <p className="nt-mealtype-hint">Looks like this is close to your workout time ({basics.workoutTime}) — marked as {MEAL_TYPE_LABEL[suggested]}, change it below if that's wrong.</p>
        )}
        <div className="nt-mealtype-row">
          {mealTypeOptions.map((mt) => (
            <button key={mt.key} className={`nt-mealtype-pill ${mealType === mt.key ? "active" : ""}`} onClick={() => setMealType(mt.key)}>{mt.label}</button>
          ))}
        </div>
        {mode === "search" && <SearchFood customFoods={customFoods} recentFoods={recentFoods} onAddMeals={stamp} />}
        {mode === "scan" && <ScanFood onAddMeals={stamp} onLimitReached={onLimitReached} />}
        {mode === "custom" && <CustomFood onSave={(f) => { onSaveCustomFood(f); stamp([{ id: uid(), name: f.name, cal: f.cal, p: f.p, c: f.c, f: f.f }]); }} />}
      </div>
    </div>
  );
}

function SearchFood({ customFoods, recentFoods, onAddMeals }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(null);
  const [mult, setMult] = useState(1);
  const all = [...customFoods.map((f) => ({ ...f, custom: true })), ...FOOD_DB];
  const results = q.trim() ? all.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())) : null;
  const recents = (recentFoods || []).map((f) => ({ ...f, serving: "same as last time", recent: true }));

  if (picked) {
    const item = { id: uid(), name: `${picked.name} (${mult}x)`, cal: picked.cal * mult, p: picked.p * mult, c: picked.c * mult, f: picked.f * mult };
    return (
      <div className="nt-modal-body">
        <button className="nt-back" onClick={() => setPicked(null)}><ChevronLeft size={16} /> Back</button>
        <h3 className="nt-food-title">{picked.name}</h3>
        <p className="nt-note">Serving: {picked.serving}</p>
        <div className="nt-qty-row">
          <button className="nt-iconbtn" onClick={() => setMult((m) => Math.max(0.5, round(m - 0.5)))}><Minus size={14} /></button>
          <span>{mult}x serving</span>
          <button className="nt-iconbtn" onClick={() => setMult((m) => round(m + 0.5))}><Plus size={14} /></button>
        </div>
        <div className="nt-macro-preview">
          <span>{Math.round(item.cal)} kcal</span><span>P {round(item.p)}g</span><span>C {round(item.c)}g</span><span>F {round(item.f)}g</span>
        </div>
        <button className="nt-btn primary full" onClick={() => onAddMeals([item])}>Add to log</button>
      </div>
    );
  }

  return (
    <div className="nt-modal-body">
      <div className="nt-search-box"><Search size={16} /><input autoFocus placeholder="Search foods, e.g. dal, roti, chicken…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {!results && recents.length > 0 && (
        <>
          <p className="nt-mini-label">Recent</p>
          <div className="nt-food-results" style={{ marginBottom: 14 }}>
            {recents.map((f, i) => (
              <button key={`r-${i}`} className="nt-food-row" onClick={() => setPicked(f)}>
                <div><div className="nt-food-name">{f.name}<span className="nt-tag alt">recent</span></div><div className="nt-food-meta">{Math.round(f.cal)} kcal</div></div>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
          <p className="nt-mini-label">All foods</p>
        </>
      )}
      <div className="nt-food-results">
        {(results || all.slice(0, 12)).map((f) => (
          <button key={f.name} className="nt-food-row" onClick={() => setPicked(f)}>
            <div><div className="nt-food-name">{f.name}{f.custom && <span className="nt-tag">custom</span>}</div><div className="nt-food-meta">{f.serving} · {f.cal} kcal</div></div>
            <ChevronRight size={16} />
          </button>
        ))}
        {results && results.length === 0 && <p className="nt-empty">No matches — try "Custom" to add your own food.</p>}
      </div>
    </div>
  );
}

function CustomFood({ onSave }) {
  const [f, setF] = useState({ name: "", serving: "1 serving", cal: "", p: "", c: "", f: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name && f.cal !== "";
  return (
    <div className="nt-modal-body">
      <label className="nt-field"><span>Food name</span><input value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
      <label className="nt-field"><span>Serving description</span><input value={f.serving} onChange={(e) => set("serving", e.target.value)} /></label>
      <div className="nt-form-grid two">
        <label className="nt-field"><span>Calories</span><input type="number" value={f.cal} onChange={(e) => set("cal", Number(e.target.value))} /></label>
        <label className="nt-field"><span>Protein (g)</span><input type="number" value={f.p} onChange={(e) => set("p", Number(e.target.value))} /></label>
        <label className="nt-field"><span>Carbs (g)</span><input type="number" value={f.c} onChange={(e) => set("c", Number(e.target.value))} /></label>
        <label className="nt-field"><span>Fat (g)</span><input type="number" value={f.f} onChange={(e) => set("f", Number(e.target.value))} /></label>
      </div>
      <button className="nt-btn primary full" disabled={!valid} onClick={() => onSave({ ...f, cat: "Custom" })}>Save & add to log</button>
    </div>
  );
}

function ScanFood({ onAddMeals, onLimitReached }) {
  const [img, setImg] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImg({ data: b64, type: file.type, preview: URL.createObjectURL(file) });
    setItems(null); setError("");
  };

  const analyze = async () => {
    setAnalyzing(false);
    setError("Photo scanning needs an image-recognition service. Since this version uses no external AI/API key, please use Search or Manual entry to add the food.");
  };

  const updateItem = (id, key, val) => setItems((prev) => prev.map((it) => it.id === id ? { ...it, [key]: key === "name" || key === "portion" ? val : Number(val) } : it));
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
  const addBlank = () => setItems((prev) => [...prev, { id: uid(), name: "New item", portion: "", cal: 0, p: 0, c: 0, f: 0 }]);

  if (items) {
    return (
      <div className="nt-modal-body">
        <p className="nt-note">Adjust anything that looks off, then add to your log.</p>
        {items.map((it) => (
          <div className="nt-scan-item" key={it.id}>
            <div className="nt-scan-item-top">
              <input className="nt-scan-name" value={it.name} onChange={(e) => updateItem(it.id, "name", e.target.value)} />
              <button className="nt-iconbtn subtle" onClick={() => removeItem(it.id)}><X size={14} /></button>
            </div>
            <div className="nt-scan-macros">
              <MiniNum label="kcal" val={it.cal} onChange={(v) => updateItem(it.id, "cal", v)} />
              <MiniNum label="P" val={it.p} onChange={(v) => updateItem(it.id, "p", v)} />
              <MiniNum label="C" val={it.c} onChange={(v) => updateItem(it.id, "c", v)} />
              <MiniNum label="F" val={it.f} onChange={(v) => updateItem(it.id, "f", v)} />
            </div>
          </div>
        ))}
        <button className="nt-btn ghost full" onClick={addBlank}><Plus size={14} /> Add item manually</button>
        <button className="nt-btn primary full" onClick={() => onAddMeals(items.map((it) => ({ id: it.id, name: it.name, cal: it.cal, p: it.p, c: it.c, f: it.f })))}>
          Add {items.length} item{items.length !== 1 ? "s" : ""} to log
        </button>
      </div>
    );
  }

  return (
    <div className="nt-modal-body">
      {!img && (
        <div className="nt-scan-choice">
          <button className="nt-scan-drop" onClick={() => cameraRef.current?.click()}>
            <Camera size={26} /><span>Take a photo</span>
          </button>
          <button className="nt-scan-drop alt" onClick={() => galleryRef.current?.click()}>
            <Plus size={26} /><span>Choose from library</span>
          </button>
        </div>
      )}
      {img && (
        <div className="nt-scan-preview">
          <img src={img.preview} alt="meal" />
          <div className="nt-scan-retake-row">
            <button className="nt-btn ghost" onClick={() => cameraRef.current?.click()}>Retake photo</button>
            <button className="nt-btn ghost" onClick={() => galleryRef.current?.click()}>Choose different</button>
          </div>
        </div>
      )}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={onFile} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
      {error && <p className="nt-note error">{error}</p>}
      {img && <button className="nt-btn primary full" onClick={analyze} disabled={analyzing}>{analyzing ? <><Loader2 className="nt-spin" size={16} /> Analyzing…</> : "Check photo"}</button>}
    </div>
  );
}

function MiniNum({ label, val, onChange }) {
  return <label className="nt-mininum"><span>{label}</span><input type="number" value={val} onChange={(e) => onChange(e.target.value)} /></label>;
}

/* ---------------------------------------------------------------
   Styles
------------------------------------------------------------------*/
function StyleBlock() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bitter:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
      .nt-root {
        --nt-bg: #F4EFE0; --nt-surface: #FFFFFF; --nt-surface-2: #FBF7EC;
        --nt-ink: #241E13; --nt-ink-soft: #7C7057; --nt-ink-deep: #1E2A1F;
        --nt-border: #E6DCC0; --nt-accent: #E08A1E; --nt-accent-2: #C1442B; --nt-accent-ink: #8A4F0C;
        --nt-prot: #B23A2B; --nt-carb: #D9A02A; --nt-fat: #1E7A6E;
        font-family: 'Inter', sans-serif; color: var(--nt-ink);
        background: linear-gradient(160deg, #FBF3E1 0%, #F4EEDC 45%, #EFE7CF 100%);
        min-height: 100vh; width: 100%;
      }
      .nt-root.dark {
        --nt-bg: #1B1712; --nt-surface: #262019; --nt-surface-2: #2E271D;
        --nt-ink: #F2EADC; --nt-ink-soft: #B8AB92; --nt-ink-deep: #12100C;
        --nt-border: #3C3325; --nt-accent: #F0A038; --nt-accent-2: #D9613F; --nt-accent-ink: #F5C57E;
        background: linear-gradient(160deg, #1E1A14 0%, #1B1712 45%, #17130F 100%);
      }
      .nt-root.dark .nt-row { border-bottom-color: #3C3325; }
      .nt-root.dark .nt-scan-drop, .nt-root.dark .nt-scan-drop.alt { background: linear-gradient(135deg, #2E271D, #262019); }
      .nt-root.dark .nt-mealtype-pill, .nt-root.dark .nt-cat-pill, .nt-root.dark .nt-food-row, .nt-root.dark .nt-search-box, .nt-root.dark .nt-field input, .nt-root.dark .nt-field select { background: var(--nt-surface); color: var(--nt-ink); }
      .nt-root.dark .nt-tag { background:#3C3325; }

      .nt-root.ocean {
        --nt-bg: #E9F2F5; --nt-surface: #FFFFFF; --nt-surface-2: #F1F8FA;
        --nt-ink: #16323D; --nt-ink-soft: #5C7A85; --nt-ink-deep: #0D2630;
        --nt-border: #D3E6EA; --nt-accent: #1E9BD7; --nt-accent-2: #0F6E9E; --nt-accent-ink: #0B4E70;
        background: linear-gradient(160deg, #F0F8FA 0%, #E9F2F5 45%, #DEECEF 100%);
      }
      .nt-root.ocean .nt-row { border-bottom-color: #DCEBEE; }

      .nt-root.forest {
        --nt-bg: #EFF3EA; --nt-surface: #FFFFFF; --nt-surface-2: #F5F8F0;
        --nt-ink: #223021; --nt-ink-soft: #6B7A64; --nt-ink-deep: #14200F;
        --nt-border: #DCE6D2; --nt-accent: #4C8C4A; --nt-accent-2: #2F6B3C; --nt-accent-ink: #2A5A2E;
        background: linear-gradient(160deg, #F4F7EF 0%, #EFF3EA 45%, #E6ECDD 100%);
      }
      .nt-root.forest .nt-row { border-bottom-color: #E1E9D8; }

      .nt-theme-row { display:flex; gap:8px; margin-top:8px; }
      .nt-theme-grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px; }
      .nt-theme-btn { flex:1; padding: 10px; border-radius:11px; border:1px solid var(--nt-border); background: var(--nt-surface); color: var(--nt-ink-soft); font-weight:600; font-size:13px; cursor:pointer; }
      .nt-theme-btn.active { background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; border-color: transparent; }
      .nt-center { display:flex; align-items:center; justify-content:center; min-height: 400px; }
      .nt-spin { animation: nt-spin 0.9s linear infinite; }
      @keyframes nt-spin { to { transform: rotate(360deg); } }
      .nt-shell { max-width: 460px; margin: 0 auto; position: relative; min-height: 100vh; display:flex; flex-direction:column; }
      .nt-content { flex:1; padding: 0 18px 96px; }
      .nt-page { padding-top: 20px; }
      .nt-page-head { display:flex; align-items:center; justify-content:space-between; margin-bottom: 18px; }
      .nt-page-head h1 { font-family:'Bitter',serif; font-size: 27px; font-weight:800; margin:0; letter-spacing:-0.3px; }
      .nt-eyebrow { color: var(--nt-ink-soft); font-size: 12.5px; margin: 0 0 2px; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
      .nt-subhead { font-family:'Bitter',serif; font-size: 18px; font-weight:700; margin: 26px 0 12px; }

      .nt-banner { display:flex; align-items:center; gap:9px; background: linear-gradient(135deg, #FFF3DC, #FBE6C8); border:1px solid #F0D8A6; color: var(--nt-accent-ink); font-size:12.5px; font-weight:500; padding: 11px 16px; margin: 14px 18px 0; border-radius:14px; box-shadow: 0 3px 10px rgba(224,138,30,0.12); }
      .nt-banner span { flex:1; line-height:1.4; }
      .nt-banner button { background:none; border:none; color: var(--nt-accent-ink); opacity:0.6; cursor:pointer; flex-shrink:0; }

      .nt-dash-header { position: relative; margin: 0 -18px 0; padding: 20px 18px 22px; overflow: hidden; border-radius: 0 0 28px 28px; background: linear-gradient(155deg, #24291B 0%, #1E2A1F 55%, #23301F 100%); color:#fff; }
      .nt-dash-header::before { content:''; position:absolute; top:-60px; right:-50px; width:200px; height:200px; border-radius:50%; background: radial-gradient(circle, rgba(224,138,30,0.35), transparent 70%); }
      .nt-dash-header::after { content:''; position:absolute; bottom:-70px; left:-40px; width:180px; height:180px; border-radius:50%; background: radial-gradient(circle, rgba(30,122,110,0.35), transparent 70%); }
      .nt-dash-header .nt-page-head h1 { color:#fff; }
      .nt-dash-header .nt-eyebrow { color: rgba(255,255,255,0.6); }
      .nt-dash-header .nt-iconbtn { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.18); color:#fff; }

      .nt-hero { position:relative; z-index:1; display:flex; gap: 20px; align-items:center; }
      .nt-ring { --pct: 0; width: 112px; height: 112px; border-radius: 50%; flex-shrink:0; background: conic-gradient(from -90deg, var(--nt-accent) calc(var(--pct)*1%), rgba(255,255,255,0.14) 0); display:flex; align-items:center; justify-content:center; box-shadow: 0 0 0 6px rgba(255,255,255,0.05); }
      .nt-ring-inner { width: 88px; height: 88px; border-radius:50%; background: var(--nt-ink-deep); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; box-shadow: inset 0 0 14px rgba(0,0,0,0.25); }
      .nt-flame { color: var(--nt-accent); }
      .nt-ring-num { font-family:'Bitter',serif; font-size: 21px; font-weight:800; line-height:1.2; margin-top:2px; }
      .nt-ring-sub { font-size: 10px; color: rgba(255,255,255,0.55); }
      .nt-hero-side { flex:1; min-width:0; }
      .nt-remain { font-weight:700; margin-bottom: 12px; font-size: 14.5px; color:#fff; }

      .nt-macrobar { margin-bottom: 9px; }
      .nt-macrobar-top { display:flex; justify-content:space-between; align-items:center; font-size: 11px; color: rgba(255,255,255,0.65); margin-bottom:4px; }
      .nt-macrobar-label { display:flex; align-items:center; }
      .nt-macro-badge { width:15px; height:15px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; margin-right:5px; color:#fff; }
      .nt-macro-badge.prot { background: var(--nt-prot); }
      .nt-macro-badge.carb { background: var(--nt-carb); }
      .nt-macro-badge.fat { background: var(--nt-fat); }
      .nt-macrobar-track { height: 6px; background: rgba(255,255,255,0.14); border-radius: 4px; overflow:hidden; }
      .nt-macrobar-fill { height:100%; border-radius:4px; }
      .nt-macrobar-fill.prot { background: var(--nt-prot); }
      .nt-macrobar-fill.carb { background: var(--nt-carb); }
      .nt-macrobar-fill.fat { background: var(--nt-fat); }

      .nt-quickrow { display:flex; gap:10px; margin-top:18px; }
      .nt-add-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:8px; background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; border:none; border-radius: 15px; padding: 13px; font-weight:700; font-size:13.5px; cursor:pointer; box-shadow: 0 6px 16px rgba(193,68,43,0.28); transition: transform 0.12s; }
      .nt-add-btn:active { transform: scale(0.97); }
      .nt-add-btn.ghost { background: var(--nt-surface); color: var(--nt-ink); border:1px solid var(--nt-border); box-shadow: 0 2px 8px rgba(36,31,22,0.06); }
      .nt-chip-icon { width:24px; height:24px; border-radius:50%; background: rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; }
      .nt-chip-icon.alt { background: linear-gradient(135deg, var(--nt-fat), #164F49); color:#fff; }

      .nt-empty { color: var(--nt-ink-soft); font-size: 13px; line-height:1.5; margin:0; }
      .nt-empty-block { display:flex; flex-direction:column; align-items:center; text-align:center; gap:10px; padding: 26px 16px; background: var(--nt-surface-2); border:1px dashed var(--nt-border); border-radius:16px; }
      .nt-empty-icon { width:44px; height:44px; border-radius:50%; background: linear-gradient(135deg, #FFEFD2, #FBDFAF); color: var(--nt-accent-ink); display:flex; align-items:center; justify-content:center; }
      .nt-empty-icon.alt { background: linear-gradient(135deg, #DCEFEC, #C3E3DE); color: var(--nt-fat); }

      .nt-header-actions { display:flex; align-items:center; gap:8px; }
      .nt-streak-badge { display:flex; align-items:center; gap:4px; background: rgba(224,138,30,0.22); color: #FFD79A; font-size:12px; font-weight:700; padding: 6px 10px; border-radius: 999px; }
      .nt-mealtype-row { display:flex; gap:6px; padding: 12px 16px 0; overflow-x:auto; }
      .nt-mealtype-row::-webkit-scrollbar { display:none; }
      .nt-mealtype-pill { flex-shrink:0; white-space:nowrap; text-align:center; padding: 7px 12px; border-radius:10px; border:1px solid var(--nt-border); background:#fff; font-size:11.5px; font-weight:600; color: var(--nt-ink-soft); cursor:pointer; }
      .nt-mealtype-pill.active { background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; border-color: transparent; }
      .nt-mealtype-hint { font-size:11.5px; color: var(--nt-accent-ink); background: linear-gradient(135deg, #FFF3DC, #FBE6C8); margin: 12px 16px 0; padding: 8px 12px; border-radius:10px; line-height:1.4; }
      .nt-cat-row { display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom: 4px; }
      .nt-cat-row::-webkit-scrollbar { display:none; }
      .nt-cat-pill { flex-shrink:0; white-space:nowrap; padding: 7px 13px; border-radius: 999px; border:1px solid var(--nt-border); background:#fff; font-size:12px; font-weight:600; color: var(--nt-ink-soft); cursor:pointer; }
      .nt-cat-pill.active { background: var(--nt-ink-deep); color:#fff; border-color: transparent; }
      .nt-ai-tag { display:inline-block; font-size:9px; font-weight:800; letter-spacing:0.5px; background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; padding: 2px 6px; border-radius:6px; margin-left:7px; vertical-align:middle; }
      .nt-asktextbtn { display:block; background:none; border:none; color: var(--nt-accent-ink); font-size:11.5px; font-weight:700; padding:0; margin-top:8px; cursor:pointer; }
      .nt-asktextbtn:disabled { opacity:0.4; }
      .nt-mini-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color: var(--nt-ink-soft); margin: 4px 0 6px; }
      .nt-tag.alt { background:#DCEFEC; color: var(--nt-fat); }

      .nt-tracker-row { display:flex; gap:10px; margin-top: 14px; }
      .nt-tracker-card { flex:1; background: var(--nt-surface); border:1px solid var(--nt-border); border-radius:16px; padding: 13px 14px; box-shadow: 0 3px 10px rgba(36,31,22,0.05); }
      .nt-tracker-top { display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700; margin-bottom:8px; }
      .nt-tracker-icon { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; }
      .nt-tracker-icon.water { background: linear-gradient(135deg, var(--nt-fat), #164F49); }
      .nt-tracker-icon.ex { background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); }
      .nt-tracker-icon.fast { background: linear-gradient(135deg, #7B5EC9, #4E3B94); }
      .nt-macrobar-fill.fast { background: linear-gradient(90deg, #7B5EC9, #4E3B94); }
      .nt-fast-time { font-family:'Bitter',serif; font-size:22px; font-weight:800; margin-top:4px; }
      .nt-fast-target { font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color: var(--nt-ink-soft); }
      .nt-fast-options { display:flex; gap:8px; margin: 10px 0; }
      .nt-notes-area { width:100%; min-height:80px; padding: 12px 14px; border-radius:14px; border:1px solid var(--nt-border); background: var(--nt-surface); font-family:'Inter',sans-serif; font-size:13.5px; color: var(--nt-ink); resize: vertical; }
      .nt-notes-area:focus { outline: 2px solid var(--nt-accent); }
      .nt-water-row { display:flex; gap:4px; flex-wrap:wrap; }
      .nt-water-drop { width:16px; height:20px; border:none; background: #E3EEEC; border-radius: 3px 3px 8px 8px; cursor:pointer; padding:0; }
      .nt-water-drop.filled { background: linear-gradient(180deg, #4FA89C, var(--nt-fat)); }
      .nt-tracker-sub { font-size:11px; color: var(--nt-ink-soft); margin-top:7px; font-weight:600; }
      .nt-tracker-sub.big { font-size:16px; color: var(--nt-ink); font-family:'Bitter',serif; font-weight:700; margin-top:2px; }
      .nt-tracker-add { display:flex; align-items:center; gap:3px; background:none; border:none; color: var(--nt-accent-ink); font-size:11px; font-weight:700; padding:0; margin-top:7px; cursor:pointer; }

      .nt-badge-strip { display:flex; align-items:center; gap:6px; width:100%; background: var(--nt-surface); border:1px solid var(--nt-border); border-radius:14px; padding: 10px 14px; margin-top:14px; cursor:pointer; box-shadow: 0 2px 8px rgba(36,31,22,0.05); }
      .nt-badge-chip { width:24px; height:24px; border-radius:50%; background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; display:flex; align-items:center; justify-content:center; margin-left:-8px; border:2px solid var(--nt-surface); }
      .nt-badge-chip:first-child { margin-left:0; }
      .nt-badge-count { margin-left:8px; font-size:12px; font-weight:600; color: var(--nt-ink-soft); }
      .nt-achievement-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; }
      .nt-achievement { display:flex; flex-direction:column; align-items:center; gap:6px; text-align:center; opacity:0.35; }
      .nt-achievement.unlocked { opacity:1; }
      .nt-achievement-icon { width:38px; height:38px; border-radius:50%; background:#EEEBE1; display:flex; align-items:center; justify-content:center; color: var(--nt-ink-soft); }
      .nt-achievement.unlocked .nt-achievement-icon { background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; }
      .nt-achievement span { font-size:10.5px; font-weight:600; color: var(--nt-ink-soft); line-height:1.3; }

      .nt-meal-group { margin-bottom: 14px; }
      .nt-meal-group-label { font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color: var(--nt-ink-soft); margin-bottom:8px; }

      .nt-bar-chart { display:flex; justify-content:space-between; align-items:flex-end; gap:6px; height:110px; }
      .nt-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end; }
      .nt-bar-track { width:100%; flex:1; display:flex; align-items:flex-end; }
      .nt-bar-fill { width:100%; background: linear-gradient(180deg, var(--nt-accent), var(--nt-accent-2)); border-radius: 6px 6px 3px 3px; min-height:3px; }
      .nt-bar-label { font-size:10.5px; color: var(--nt-ink-soft); font-weight:600; }

      .nt-meal-list { display:flex; flex-direction:column; gap:9px; }
      .nt-meal-item { background: var(--nt-surface); border:1px solid var(--nt-border); border-radius:14px; padding: 13px 15px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 2px 8px rgba(36,31,22,0.05); }
      .nt-meal-name { font-weight:700; font-size:14px; }
      .nt-meal-macros { font-size:12px; color: var(--nt-ink-soft); margin-top:2px; }

      .nt-card { background: var(--nt-surface); border:1px solid var(--nt-border); border-radius:16px; padding: 15px 17px; margin-bottom: 12px; box-shadow: 0 3px 12px rgba(36,31,22,0.05); }
      .nt-card.data-card { background: var(--nt-surface-2); }
      .nt-data-head { display:flex; align-items:center; gap:7px; font-weight:700; font-size:13.5px; margin-bottom:6px; color: var(--nt-accent-ink); }
      .nt-row { display:flex; justify-content:space-between; padding: 8px 0; font-size:14px; border-bottom: 1px solid #F1ECDA; }
      .nt-row:last-child { border-bottom:none; }
      .nt-row .hl { color: var(--nt-accent-2); font-weight:700; }
      .nt-subhead-row { display:flex; align-items:center; justify-content:space-between; margin: 26px 0 12px; }
      .nt-subhead-row .nt-subhead { margin: 0; }
      .nt-textbtn { background:none; border:none; color: var(--nt-accent-2); font-weight:700; font-size:12.5px; cursor:pointer; padding:4px 8px; }
      .nt-editrow { display:flex; align-items:center; gap:10px; padding: 8px 0; border-bottom: 1px solid #F1ECDA; }
      .nt-editrow:last-child { border-bottom:none; }
      .nt-editrow span:first-child { flex:1; font-size:13.5px; color: var(--nt-ink-soft); font-weight:500; }
      .nt-editrow input { width:80px; padding: 7px 9px; border-radius:9px; border:1px solid var(--nt-border); font-size:14px; font-weight:700; text-align:right; }
      .nt-editunit { font-size:12px; color: var(--nt-ink-soft); width:30px; }
      .nt-note { font-size: 12.5px; color: var(--nt-ink-soft); line-height:1.55; }
      .nt-note.error { color: var(--nt-prot); }
      .nt-note.nt-eta { background: linear-gradient(135deg, #FFF3DC, #FBE6C8); color: var(--nt-accent-ink); padding: 10px 13px; border-radius: 11px; font-weight:500; }

      .nt-iconbtn { width:37px; height:37px; border-radius:11px; border:1px solid var(--nt-border); background:var(--nt-surface); display:flex; align-items:center; justify-content:center; cursor:pointer; color: var(--nt-ink); }
      .nt-iconbtn.subtle { border:none; background:transparent; color: var(--nt-ink-soft); width:28px; height:28px; }
      .nt-iconbtn.primary { background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; border:none; }

      .nt-btn { border:none; border-radius:13px; padding: 12px 18px; font-weight:700; font-size:14px; cursor:pointer; transition: transform 0.12s; }
      .nt-btn:active { transform: scale(0.98); }
      .nt-btn.primary { background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; box-shadow: 0 6px 16px rgba(193,68,43,0.25); }
      .nt-btn.primary:disabled { opacity:0.4; cursor:not-allowed; box-shadow:none; }
      .nt-btn.ghost { background: var(--nt-surface); border:1px solid var(--nt-border); color: var(--nt-ink); }
      .nt-btn.full { width:100%; display:flex; align-items:center; justify-content:center; gap:6px; margin-top: 10px; }

      .nt-nav { display:flex; margin: 0 14px 14px; background: var(--nt-surface); border-radius: 20px; box-shadow: 0 8px 24px rgba(36,31,22,0.14); position: sticky; bottom:14px; padding: 6px; }
      .nt-navbtn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding: 6px 0 7px; background:none; border:none; cursor:pointer; color: var(--nt-ink-soft); font-size: 10px; font-family:'Inter',sans-serif; font-weight:500; border-radius:14px; }
      .nt-navbtn-icon { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:1px; transition: background 0.15s; }
      .nt-navbtn.active { color: var(--nt-ink); font-weight:700; }
      .nt-navbtn.active .nt-navbtn-icon { background: linear-gradient(135deg, var(--nt-accent), var(--nt-accent-2)); color:#fff; }

      .nt-form-wrap { max-width: 460px; margin: 0 auto; padding: 32px 18px 60px; }
      .nt-warning-badge { width:52px; height:52px; border-radius:50%; background: linear-gradient(135deg, #FFE3B0, #FBC98C); color: var(--nt-accent-ink); display:flex; align-items:center; justify-content:center; margin: 0 auto 16px; }
      .nt-warning-title { font-family:'Bitter',serif; font-size: 21px; font-weight:800; text-align:center; margin: 0 0 22px; line-height:1.3; }
      .nt-warning-list { display:flex; flex-direction:column; gap:14px; margin-bottom: 24px; }
      .nt-warning-item { background: var(--nt-surface); border:1px solid var(--nt-border); border-radius:14px; padding: 14px 16px; }
      .nt-warning-item strong { display:block; font-size:13.5px; margin-bottom:5px; }
      .nt-warning-item p { font-size:12.5px; color: var(--nt-ink-soft); line-height:1.55; margin:0; }
      .nt-form-header { display:flex; gap:12px; margin-bottom: 24px; color: var(--nt-accent-ink); }
      .nt-form-header h1 { font-family:'Bitter',serif; font-size: 23px; margin:0 0 5px; color: var(--nt-ink); font-weight:800; }
      .nt-form-header p { font-size: 13px; color: var(--nt-ink-soft); margin:0; line-height:1.55; }
      .nt-form-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .nt-form-grid.two { grid-template-columns: 1fr 1fr; }
      .nt-field { display:flex; flex-direction:column; gap:5px; font-size: 12.5px; color: var(--nt-ink-soft); font-weight:500; }
      .nt-field input, .nt-field select { font-family:'Inter',sans-serif; padding: 10px 11px; border-radius:10px; border:1px solid var(--nt-border); font-size: 14px; color: var(--nt-ink); background: var(--nt-surface); }
      .nt-field input:focus, .nt-field select:focus { outline: 2px solid var(--nt-accent); outline-offset: 1px; }
      .nt-form-actions { display:flex; justify-content:flex-end; gap:10px; margin-top: 24px; }

      .nt-modal-backdrop { position: fixed; inset:0; background: rgba(20,17,10,0.5); display:flex; align-items:flex-end; justify-content:center; z-index: 50; }
      .nt-limit-modal { background: var(--nt-surface); max-width: 400px; width: calc(100% - 40px); margin: auto; border-radius: 22px; padding: 26px 22px; text-align:center; box-shadow: 0 12px 40px rgba(0,0,0,0.25); }
      .nt-limit-icon { width:50px; height:50px; border-radius:50%; background: linear-gradient(135deg, #FFE3B0, #FBC98C); color: var(--nt-accent-ink); display:flex; align-items:center; justify-content:center; margin: 0 auto 14px; }
      .nt-limit-modal h2 { font-family:'Bitter',serif; font-size: 18px; margin: 0 0 10px; font-weight:800; }
      .nt-limit-modal p { font-size:13px; color: var(--nt-ink-soft); line-height:1.55; margin: 0 0 10px; }
      .nt-limit-modal .nt-limit-sub { font-size:12px; }
      .nt-modal { background: var(--nt-bg); width:100%; max-width: 460px; border-radius: 24px 24px 0 0; max-height: 85vh; display:flex; flex-direction:column; overflow:hidden; box-shadow: 0 -8px 30px rgba(0,0,0,0.2); }
      .nt-modal-head { display:flex; justify-content:space-between; align-items:center; padding: 15px 16px; border-bottom: 1px solid var(--nt-border); }
      .nt-history-nav { display:flex; align-items:center; gap:10px; }
      .nt-history-date { font-weight:700; font-size:14px; min-width:120px; text-align:center; }
      .nt-tabs-inline { display:flex; gap:4px; background:#EFE7D0; padding:3px; border-radius:11px; }
      .nt-tabs-inline button { border:none; background:none; padding: 7px 13px; border-radius:9px; font-size:12.5px; font-weight:600; color: var(--nt-ink-soft); cursor:pointer; }
      .nt-tabs-inline button.active { background: var(--nt-surface); color: var(--nt-ink); box-shadow: 0 2px 6px rgba(36,31,22,0.1); }
      .nt-modal-body { padding: 16px; overflow-y:auto; }

      .nt-search-box { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid var(--nt-border); border-radius:13px; padding: 11px 13px; margin-bottom: 12px; color: var(--nt-ink-soft); }
      .nt-search-box input { border:none; outline:none; flex:1; font-size:14px; font-family:'Inter',sans-serif; color: var(--nt-ink); }
      .nt-food-results { display:flex; flex-direction:column; gap:7px; max-height: 340px; overflow-y:auto; }
      .nt-food-row { display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid var(--nt-border); border-radius:12px; padding: 11px 13px; cursor:pointer; text-align:left; }
      .nt-food-name { font-size: 13.5px; font-weight:700; }
      .nt-tag { font-size:9.5px; color: var(--nt-accent-ink); background:#F7E7C4; padding:1px 6px; border-radius:6px; margin-left:6px; font-weight:600; }
      .nt-food-meta { font-size:11.5px; color: var(--nt-ink-soft); margin-top:2px; }

      .nt-back { display:flex; align-items:center; gap:4px; background:none; border:none; color: var(--nt-ink-soft); font-size:13px; cursor:pointer; padding:0 0 12px; font-weight:500; }
      .nt-food-title { font-family:'Bitter',serif; font-size:19px; margin:0 0 2px; font-weight:700; }
      .nt-qty-row { display:flex; align-items:center; gap:12px; margin: 14px 0; font-weight:700; }
      .nt-macro-preview { display:flex; gap:14px; font-size:13px; color: var(--nt-ink-soft); margin-bottom: 14px; font-weight:600; }

      .nt-scan-choice { display:flex; gap:10px; }
      .nt-scan-drop { flex:1; display:flex; flex-direction:column; align-items:center; gap:10px; padding: 32px 14px; border: 1.5px dashed var(--nt-accent); border-radius:18px; background: linear-gradient(135deg, #FFF6E6, #FBEEDA); color: var(--nt-accent-ink); font-size:12.5px; font-weight:600; cursor:pointer; text-align:center; }
      .nt-scan-drop.alt { border-color: var(--nt-fat); background: linear-gradient(135deg, #E8F4F2, #DCEEEA); color: var(--nt-fat); }
      .nt-scan-preview { display:flex; flex-direction:column; align-items:center; gap:10px; margin-bottom: 12px; }
      .nt-scan-preview img { width:100%; max-height: 220px; object-fit:cover; border-radius:16px; }
      .nt-scan-retake-row { display:flex; gap:8px; width:100%; }
      .nt-scan-retake-row .nt-btn { flex:1; }
      .nt-scan-item { background:#fff; border:1px solid var(--nt-border); border-radius:13px; padding:11px 13px; margin-bottom:8px; }
      .nt-scan-item-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
      .nt-scan-name { border:none; font-weight:700; font-size:14px; font-family:'Inter',sans-serif; flex:1; color: var(--nt-ink); }
      .nt-scan-macros { display:flex; gap:8px; }
      .nt-mininum { display:flex; flex-direction:column; gap:2px; font-size:10.5px; color: var(--nt-ink-soft); flex:1; font-weight:600; }
      .nt-mininum input { width:100%; padding:6px 7px; border-radius:8px; border:1px solid var(--nt-border); font-size:12.5px; }

      .nt-weight-input { display:flex; align-items:center; gap:10px; }
      .nt-weight-input input { flex:1; padding: 11px 13px; border-radius:11px; border:1px solid var(--nt-border); font-size:17px; font-weight:700; }
      .nt-weight-input span { color: var(--nt-ink-soft); font-weight:600; }
      .nt-chart { width:100%; height:120px; }

      .nt-chat-page { display:flex; flex-direction:column; height: calc(100vh - 150px); padding-bottom:0; }
      .nt-intake-page { height: calc(100vh - 40px); }
      .nt-chat-scroll { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:11px; padding-bottom:12px; }
      .nt-bubble { max-width: 82%; padding: 11px 14px; border-radius: 16px; font-size: 13.5px; line-height:1.55; white-space:pre-wrap; }
      .nt-bubble.user { align-self:flex-end; background: linear-gradient(135deg, var(--nt-ink-deep), #2E4030); color:#fff; border-bottom-right-radius:5px; box-shadow: 0 3px 10px rgba(30,42,31,0.2); }
      .nt-bubble.assistant { align-self:flex-start; background:#fff; border-left: 3px solid var(--nt-accent); border-radius: 4px 16px 16px 16px; box-shadow: 0 3px 10px rgba(36,31,22,0.07); }
      .nt-chat-input { display:flex; gap:8px; padding: 10px 0 18px; }
      .nt-chat-input input { flex:1; padding: 12px 15px; border-radius: 13px; border:1px solid var(--nt-border); font-size:14px; font-family:'Inter',sans-serif; background: var(--nt-surface); }
      .nt-chat-input input:focus { outline: 2px solid var(--nt-accent); }

      @media (max-width: 400px) { .nt-form-grid { grid-template-columns: 1fr; } }
    `}</style>
  );
}
