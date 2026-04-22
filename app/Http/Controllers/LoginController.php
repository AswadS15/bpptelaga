<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    /**
     * Menampilkan halaman login.
     */
    public function index(): Response
    {
        return Inertia::render('Login');
    }
}
