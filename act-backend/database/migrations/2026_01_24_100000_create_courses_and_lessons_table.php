<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('General');
            $table->string('level')->default('Beginner'); // Beginner, Intermediate, Advanced
            $table->string('thumbnail')->nullable();
            $table->decimal('price', 8, 2)->default(0.00);
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_url')->nullable(); // For now, store link or local path
            $table->string('content_type')->default('video'); // video, article, quiz
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('courses');
    }
};
